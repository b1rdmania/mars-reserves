/**
 * Shinami Gas Station Client for Movement Network
 * Uses @shinami/clients SDK for proper transaction sponsorship
 */

import { GasStationClient } from '@shinami/clients/aptos';
import {
    Aptos,
    AptosConfig,
    Network,
    AccountAddress,
    Ed25519PrivateKey,
    Ed25519Account,
} from '@aptos-labs/ts-sdk';

// Movement testnet configuration (verified working)
const MOVEMENT_TESTNET_CONFIG = {
    fullnodeUrl: 'https://testnet.movementnetwork.xyz/v1',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz/',
};

interface RecordMissionParams {
    userAddress: string;
    runHash: string;
    score: number;
    endingId: string;
    seed: number;
    missionIndexAddress: string;
}

interface SponsorResult {
    success: boolean;
    txHash?: string;
    explorerUrl?: string;
    error?: string;
}

/**
 * Record a mission on-chain using Shinami Gas Station for sponsorship
 * 
 * Flow:
 * 1. Build the transaction
 * 2. Send to Shinami for fee sponsorship
 * 3. Sign with backend key (fee payer is Shinami)
 * 4. Submit to Movement
 */
export async function recordMissionOnChain(
    params: RecordMissionParams,
    shinamiApiKey: string,
    backendPrivateKey?: string,
): Promise<SponsorResult> {
    try {
        // Initialize Shinami Gas Station client
        const gasClient = new GasStationClient(shinamiApiKey);

        // Initialize Aptos client for Movement testnet (following Shinami example)
        const config = new AptosConfig({
            network: Network.CUSTOM,
            fullnode: MOVEMENT_TESTNET_CONFIG.fullnodeUrl,
            faucet: MOVEMENT_TESTNET_CONFIG.faucetUrl,
        });
        const aptos = new Aptos(config);

        // For sponsored transactions, we need a signer
        // In production, this would be the user's wallet signing
        // For hackathon, we use a backend key or create a temp one
        let sender: Ed25519Account;

        if (backendPrivateKey) {
            const privateKey = new Ed25519PrivateKey(backendPrivateKey);
            sender = new Ed25519Account({ privateKey });
        } else {
            // Create ephemeral account for this submission
            // The user's address is still recorded in the event data
            sender = Ed25519Account.generate();
        }

        // CRITICAL: Trim addresses to remove any whitespace/newlines (Vercel env var issue)
        const cleanMissionIndexAddress = params.missionIndexAddress.trim();
        const senderAddress = sender.accountAddress.toString();

        // Debug logging for address validation
        console.log('[Shinami] Address diagnostics:', {
            missionIndexRaw: JSON.stringify(params.missionIndexAddress),
            missionIndexTrimmed: cleanMissionIndexAddress,
            missionIndexLen: cleanMissionIndexAddress.length,
            senderAddress,
            senderLen: senderAddress.length,
            fn: `${cleanMissionIndexAddress}::mission_index::record_mission`,
        });

        // Validate address format (should be 0x + 64 hex chars = 66 total)
        if (cleanMissionIndexAddress.length !== 66) {
            throw new Error(`Invalid MISSION_INDEX_ADDRESS length: ${cleanMissionIndexAddress.length}, expected 66`);
        }

        // Build the transaction with fee payer support
        const runHashBytes = hexToBytes(params.runHash);
        const endingIdBytes = stringToBytes(params.endingId);

        console.log('[Shinami] Arg lengths - runHash:', runHashBytes.length, 'endingId:', endingIdBytes.length);

        const transaction = await aptos.transaction.build.simple({
            sender: senderAddress,
            withFeePayer: true,
            data: {
                function: `${cleanMissionIndexAddress}::mission_index::record_mission`,
                typeArguments: [],
                functionArguments: [
                    runHashBytes,           // run_hash: vector<u8>
                    BigInt(params.score),   // score: u64
                    endingIdBytes,          // ending_id: vector<u8>
                ],
            },
        });

        console.log('[Shinami] Transaction built. Payload preview:', {
            sender: transaction.rawTransaction.sender.toString(),
            sequence_number: transaction.rawTransaction.sequence_number.toString(),
            max_gas_amount: transaction.rawTransaction.max_gas_amount.toString(),
            gas_unit_price: transaction.rawTransaction.gas_unit_price.toString(),
            expiration_timestamp_secs: transaction.rawTransaction.expiration_timestamp_secs.toString(),
            chain_id: (transaction.rawTransaction.chain_id as any).value || (transaction.rawTransaction.chain_id as any).id || 'unknown',
        });

        console.log('[Shinami] Requesting sponsorship from Shinami...');

        // Get sponsorship from Shinami
        const feePayerAuth = await gasClient.sponsorTransaction(transaction);

        console.log('[Shinami] Sponsorship received, signing transaction...');

        // Sign the transaction with sender
        const senderAuth = aptos.transaction.sign({
            signer: sender,
            transaction,
        });

        // Submit the sponsored transaction
        const pendingTx = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator: senderAuth,
            feePayerAuthenticator: feePayerAuth,
        });

        // Wait for confirmation
        const executedTx = await aptos.waitForTransaction({
            transactionHash: pendingTx.hash,
        });

        return {
            success: executedTx.success,
            txHash: pendingTx.hash,
            explorerUrl: `https://explorer.movementnetwork.xyz/txn/${pendingTx.hash}?network=bardock+testnet`,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Shinami sponsored transaction error:', errorMessage);
        // Log the full error object if possible
        try {
            console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        } catch (e) {
            console.error('Could not stringify error');
        }
        console.error('Stack:', errorStack);
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Simple version: Just check if Shinami is available and get fund info
 */
export async function checkGasStationFund(shinamiApiKey: string): Promise<{
    available: boolean;
    balance?: number;
    error?: string;
}> {
    try {
        const gasClient = new GasStationClient(shinamiApiKey);
        const fund = await gasClient.getFund();
        return {
            available: true,
            balance: fund.balance,
        };
    } catch (error) {
        return {
            available: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Helper functions
function hexToBytes(hex: string): Uint8Array {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    return bytes;
}

function stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}
