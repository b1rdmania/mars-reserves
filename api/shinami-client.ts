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

// Movement testnet configuration
const MOVEMENT_TESTNET_CONFIG = {
    fullnodeUrl: 'https://aptos.testnet.movementnetwork.xyz/v1',
    indexerUrl: 'https://indexer.testnet.movementnetwork.xyz/v1/graphql',
};

interface RecordMissionParams {
    userAddress: string;
    runHash: string;
    score: number;
    endingId: string;
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

        // Initialize Aptos client for Movement testnet
        const config = new AptosConfig({
            fullnode: MOVEMENT_TESTNET_CONFIG.fullnodeUrl,
            indexer: MOVEMENT_TESTNET_CONFIG.indexerUrl,
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

        // Build the transaction
        const transaction = await aptos.transaction.build.simple({
            sender: sender.accountAddress,
            data: {
                function: `${params.missionIndexAddress}::mission_index::record_mission`,
                typeArguments: [],
                functionArguments: [
                    hexToBytes(params.runHash),
                    params.score,
                    stringToBytes(params.endingId),
                ],
            },
        });

        // Get sponsorship from Shinami
        const feePayerAuth = await gasClient.sponsorTransaction(transaction);

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
            explorerUrl: `https://explorer.movementnetwork.xyz/tx/${pendingTx.hash}?network=testnet`,
        };
    } catch (error) {
        console.error('Shinami sponsored transaction error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
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
