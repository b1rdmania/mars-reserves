/**
 * Shinami Gas Station Client
 * Handles sponsored transaction submission to Movement network
 */

interface SponsorRequest {
    sender: string;
    payload: {
        function: string;
        type_arguments: string[];
        arguments: (string | number)[];
    };
}

interface SponsorResponse {
    success: boolean;
    txHash?: string;
    error?: string;
}

/**
 * Submit a sponsored transaction via Shinami Gas Station
 * The transaction is paid for by our Gas Station account, not the user
 */
export async function submitSponsoredTransaction(
    request: SponsorRequest,
): Promise<SponsorResponse> {
    const shinamiApiKey = process.env.SHINAMI_API_KEY;
    const movementRpcUrl = process.env.MOVEMENT_RPC_URL;
    const missionIndexAddress = process.env.MISSION_INDEX_ADDRESS;

    if (!shinamiApiKey) {
        return { success: false, error: 'SHINAMI_API_KEY not configured' };
    }

    if (!movementRpcUrl || !missionIndexAddress) {
        return { success: false, error: 'Movement configuration missing' };
    }

    try {
        // For Movement/Aptos-based chains, we use a slightly different approach
        // Since Shinami primarily supports Sui, for Movement we'll use their 
        // Aptos-compatible Gas Station or a direct sponsorship model

        // Step 1: Build the transaction
        const txPayload = {
            type: 'entry_function_payload',
            function: request.payload.function,
            type_arguments: request.payload.type_arguments,
            arguments: request.payload.arguments,
        };

        // Step 2: For hackathon/testnet, we can use a simpler approach:
        // Backend holds a funded account and submits on behalf of user
        // The user's address is recorded in the event, maintaining attribution

        // Alternative: If Shinami has Movement support, use their API:
        const sponsorResponse = await fetch('https://api.shinami.com/aptos/gas/v1', {
            method: 'POST',
            headers: {
                'X-Api-Key': shinamiApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'gas_sponsorTransaction',
                params: {
                    sender: request.sender,
                    payload: txPayload,
                    options: {
                        max_gas_amount: '10000',
                        gas_unit_price: '100',
                    },
                },
                id: 1,
            }),
        });

        if (!sponsorResponse.ok) {
            const errorText = await sponsorResponse.text();
            console.error('Shinami sponsor error:', errorText);
            return { success: false, error: `Shinami error: ${sponsorResponse.status}` };
        }

        const sponsorData = await sponsorResponse.json();

        if (sponsorData.error) {
            return { success: false, error: sponsorData.error.message };
        }

        // Step 3: Submit the sponsored transaction to Movement
        const submitResponse = await fetch(`${movementRpcUrl}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sponsorData.result.signedTransaction),
        });

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error('Movement submit error:', errorText);
            return { success: false, error: 'Transaction submission failed' };
        }

        const submitData = await submitResponse.json();

        return {
            success: true,
            txHash: submitData.hash,
        };
    } catch (error) {
        console.error('Sponsored transaction error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Build the MissionIndex record_mission payload
 */
export function buildRecordMissionPayload(
    missionIndexAddress: string,
    runHash: string,
    score: number,
    endingId: string,
) {
    return {
        function: `${missionIndexAddress}::mission_index::record_mission`,
        type_arguments: [],
        arguments: [
            // run_hash as hex bytes
            `0x${runHash}`,
            // score as u64
            score,
            // ending_id as bytes
            stringToHex(endingId),
        ],
    };
}

function stringToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}
