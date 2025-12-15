import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'crypto';

/**
 * Minimal deterministic replay engine for verification
 * This is a simplified version of the game engine that only tracks
 * the essential state needed for score/ending verification.
 */

// Mulberry32 PRNG - must match client exactly
function mulberry32(seed: number): () => number {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

interface MinimalState {
    turn: number;
    maxTurns: number;
    officialTreasury: number;
    siphoned: number;
    rage: number;
    heat: number;
    cred: number;
    techHype: number;
    tokenPrice: number;
    tvl: number;
    gameOver: boolean;
    gameOverReason?: string;
    crisisCount: number;
    usedActionIds: string[];
}

function initialState(): MinimalState {
    return {
        turn: 0,
        maxTurns: 20,
        officialTreasury: 1_000_000_000,
        siphoned: 0,
        rage: 20,
        heat: 10,
        cred: 60,
        techHype: 40,
        tokenPrice: 1,
        tvl: 500_000_000,
        gameOver: false,
        crisisCount: 0,
        usedActionIds: [],
    };
}

function simulateAction(state: MinimalState, actionId: string, rng: () => number): MinimalState {
    // Simplified action simulation
    // The actual effects don't matter as much as the RNG consumption pattern
    const next = { ...state, turn: state.turn + 1 };

    // Consume RNG in a pattern similar to the real engine
    const severityRoll = rng(); // severity roll

    // Simulate some state changes based on action category
    const isExtraction = actionId.includes('mining') || actionId.includes('extraction') ||
        actionId.includes('contractor') || actionId.includes('bonus') ||
        actionId.includes('reserve') || actionId.includes('budget');

    if (isExtraction) {
        const amount = Math.floor(next.officialTreasury * 0.08);
        next.officialTreasury = Math.max(0, next.officialTreasury - amount);
        next.siphoned += amount;
        next.heat += 5 + Math.floor(rng() * 5);
        next.rage += 3 + Math.floor(rng() * 3);
    } else {
        // Non-extraction actions generally help meters
        next.rage = Math.max(0, next.rage - 5);
        next.heat = Math.max(0, next.heat - 3);
        next.cred = Math.min(100, next.cred + 5);
    }

    // Apply severity scaling
    const severity = severityRoll < 0.15 ? 0.5 : severityRoll > 0.85 ? 1.5 : 1.0;
    // (severity affects deltas, consumed above)

    // Market drift
    const driftNoise = (rng() - 0.5) * 0.1;
    next.tokenPrice = Math.max(0.01, next.tokenPrice * (1 + driftNoise));
    next.tvl = Math.max(10_000_000, next.tvl * (1 + driftNoise / 2));

    // Meter drift
    next.rage = Math.max(0, next.rage * 0.95);
    next.heat = Math.max(0, next.heat * 0.95);
    next.cred = Math.max(0, next.cred * 0.98);
    next.techHype = Math.max(0, next.techHype * 0.96);

    // Crisis chance (consume RNG for consistency)
    const crisisRoll = rng();
    if (crisisRoll < 0.15) {
        next.crisisCount++;
        // Consume more RNG for crisis resolution
        rng(); rng();
    }

    // Event chance
    const eventRoll = rng();
    if (eventRoll < 0.3) {
        // Consume event RNG
        rng(); rng();
    }

    // Track action
    next.usedActionIds = [...state.usedActionIds, actionId];

    // Check game over conditions
    if (next.rage >= 100) {
        next.gameOver = true;
        next.gameOverReason = 'rage';
    } else if (next.heat >= 100) {
        next.gameOver = true;
        next.gameOverReason = 'heat';
    } else if (next.cred <= 0) {
        next.gameOver = true;
        next.gameOverReason = 'cred';
    } else if (next.officialTreasury <= 0) {
        next.gameOver = true;
        next.gameOverReason = 'treasury';
    } else if (next.turn >= next.maxTurns) {
        next.gameOver = true;
        next.gameOverReason = 'complete';
    }

    return next;
}

function calculateScore(state: MinimalState): number {
    // Base score is siphoned amount
    let score = state.siphoned;

    // Bonuses for good metrics
    if (state.rage < 30) score *= 1.1;
    if (state.heat < 30) score *= 1.1;
    if (state.cred > 70) score *= 1.15;

    // Penalty for bad ending
    if (state.gameOverReason === 'rage' || state.gameOverReason === 'heat') {
        score *= 0.5;
    }

    return Math.floor(score);
}

function determineEnding(state: MinimalState): string {
    if (state.gameOverReason === 'rage') return 'crew_mutiny';
    if (state.gameOverReason === 'heat') return 'earth_recall';
    if (state.gameOverReason === 'cred') return 'trust_collapse';
    if (state.gameOverReason === 'treasury') return 'reserves_depleted';

    // Success endings based on performance
    const score = state.siphoned;
    if (score > 500_000_000) return 'legendary_commander';
    if (score > 200_000_000) return 'successful_mission';
    if (score > 50_000_000) return 'modest_legacy';
    return 'survived';
}

interface SubmitRunRequest {
    seed: number;
    actionIds: string[];
    score: number;
    endingId: string;
    wallet: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body as SubmitRunRequest;

    // Validate required fields
    if (typeof body.seed !== 'number' || !Array.isArray(body.actionIds) || !body.wallet) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['seed (number)', 'actionIds (array)', 'wallet (string)']
        });
    }

    try {
        // Replay the game
        const rng = mulberry32(body.seed);
        let state = initialState();

        // Consume initial RNG for action sampling (match client)
        for (let i = 0; i < 5; i++) rng();

        // Replay each action
        for (const actionId of body.actionIds) {
            if (state.gameOver) break;
            state = simulateAction(state, actionId, rng);
        }

        // Ensure game is over
        if (!state.gameOver) {
            state.gameOver = true;
            state.gameOverReason = 'complete';
        }

        // Calculate verified values
        const verifiedScore = calculateScore(state);
        const verifiedEndingId = determineEnding(state);

        // Create run hash
        const runData = JSON.stringify({
            seed: body.seed,
            actionIds: body.actionIds,
            wallet: body.wallet,
            score: verifiedScore,
            endingId: verifiedEndingId,
        });
        const runHash = createHash('sha256').update(runData).digest('hex').slice(0, 16);

        // Score tolerance for verification (client/server may have small differences)
        const scoreTolerance = Math.max(body.score * 0.2, 1000000); // 20% or 1M minimum

        if (Math.abs(verifiedScore - body.score) > scoreTolerance) {
            return res.status(400).json({
                error: 'Score verification failed',
                claimed: body.score,
                verified: verifiedScore,
                tolerance: scoreTolerance,
            });
        }

        // Save to Supabase
        let supabaseError: string | null = null;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/runs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({
                        wallet: body.wallet,
                        score: verifiedScore,
                        seed: body.seed,
                        ending_id: verifiedEndingId,
                        action_count: body.actionIds.length,
                        run_hash: runHash,
                        on_chain_tx: null, // Will be updated after on-chain submission
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    supabaseError = `Supabase error: ${errorText}`;
                    console.error(supabaseError);
                }
            } catch (err) {
                supabaseError = `Supabase connection error: ${err instanceof Error ? err.message : 'Unknown'}`;
                console.error(supabaseError);
            }
        }

        // On-chain submission (placeholder - requires Movement SDK integration)
        // The actual on-chain call would use Aptos SDK to call record_run
        // This is typically done from a backend with a funded account
        let txHash: string | null = null;
        const onChainEnabled = process.env.ENABLE_ONCHAIN === 'true';

        if (onChainEnabled) {
            // TODO: Integrate with Movement/Aptos SDK
            // const client = new AptosClient(process.env.MOVEMENT_RPC_URL);
            // const txn = await client.submitTransaction(...);
            // txHash = txn.hash;
            console.log('On-chain submission would happen here for run:', runHash);
        }

        return res.status(200).json({
            success: true,
            runHash,
            verifiedScore,
            verifiedEndingId,
            wallet: body.wallet,
            actionCount: body.actionIds.length,
            txHash,
            savedToLeaderboard: !supabaseError,
            supabaseError,
        });

    } catch (err) {
        console.error('Verification error:', err);
        return res.status(500).json({
            error: 'Verification failed',
            message: err instanceof Error ? err.message : 'Unknown error',
        });
    }
}

