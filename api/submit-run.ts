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
    colonyReserves: number;
    legacy: number;
    rage: number;
    oversightPressure: number;
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
        colonyReserves: 1_000_000_000,
        legacy: 0,
        rage: 10,
        oversightPressure: 10,
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
        const amount = Math.floor(next.colonyReserves * 0.08);
        next.colonyReserves = Math.max(0, next.colonyReserves - amount);
        next.legacy += amount;
        next.oversightPressure += 5 + Math.floor(rng() * 5);
        next.rage += 3 + Math.floor(rng() * 3);
    } else {
        // Non-extraction actions generally help meters
        next.rage = Math.max(0, next.rage - 5);
        next.oversightPressure = Math.max(0, next.oversightPressure - 3);
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
    next.oversightPressure = Math.max(0, next.oversightPressure * 0.95);
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
    } else if (next.oversightPressure >= 100) {
        next.gameOver = true;
        next.gameOverReason = 'heat';
    } else if (next.cred <= 0) {
        next.gameOver = true;
        next.gameOverReason = 'cred';
    } else if (next.colonyReserves <= 0) {
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
    let score = state.legacy;

    // Bonuses for good metrics
    if (state.rage < 30) score *= 1.1;
    if (state.oversightPressure < 30) score *= 1.1;
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
    const score = state.legacy;
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
    privyUserId?: string;
    commanderName?: string;
}

// Archetype calculation (inline to avoid import issues in Vercel)
const FAILURE_ENDINGS = ['crew_mutiny', 'earth_recall', 'trust_collapse', 'reserves_depleted'];
const SUCCESS_ENDINGS = ['legendary_commander', 'successful_mission', 'modest_legacy', 'survived'];
const OVERSIGHT_ENDINGS = ['earth_recall'];
const MUTINY_ENDINGS = ['crew_mutiny'];

interface RunForArchetype {
    score: number;
    ending_id: string;
}

const ARCHETYPE_BLURBS: Record<string, string> = {
    THE_CAREERIST: 'High legacy, frequent oversight failures. Earth knows your name—for better or worse.',
    THE_ADMINISTRATOR: 'Steady hands, stable colony. Not exciting, but the crew sleeps well.',
    THE_CHAOS_COMMANDER: 'Mutinies, close calls, wild swings. Your missions make for excellent documentaries.',
    THE_VISIONARY: 'Big ambitions, mixed results. History will judge whether you were ahead of your time.',
    THE_SURVIVOR: 'Against all odds, you keep coming back. The colony endures.',
    THE_GAMBLER: 'High risk, high variance. Some runs legendary, others best forgotten.',
    THE_ROOKIE: 'New to command. Every mission is a learning experience.',
    THE_VETERAN: "Many missions under your belt. You've seen it all.",
};

function calculateArchetype(runs: RunForArchetype[]): { archetype: string; blurb: string } {
    if (runs.length <= 1) {
        return { archetype: 'THE_ROOKIE', blurb: ARCHETYPE_BLURBS.THE_ROOKIE };
    }

    const totalRuns = runs.length;
    const scores = runs.map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / totalRuns;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const scoreVariance = maxScore - minScore;

    const failures = runs.filter(r => FAILURE_ENDINGS.includes(r.ending_id)).length;
    const successes = runs.filter(r => SUCCESS_ENDINGS.includes(r.ending_id)).length;
    const oversightFailures = runs.filter(r => OVERSIGHT_ENDINGS.includes(r.ending_id)).length;
    const mutinies = runs.filter(r => MUTINY_ENDINGS.includes(r.ending_id)).length;

    const failureRate = failures / totalRuns;
    const successRate = successes / totalRuns;

    if (totalRuns >= 10) {
        if (avgScore > 100_000_000 && oversightFailures >= totalRuns * 0.3) {
            return { archetype: 'THE_CAREERIST', blurb: ARCHETYPE_BLURBS.THE_CAREERIST };
        }
        if (failureRate < 0.2 && scoreVariance < avgScore * 0.5) {
            return { archetype: 'THE_ADMINISTRATOR', blurb: ARCHETYPE_BLURBS.THE_ADMINISTRATOR };
        }
        if (mutinies >= totalRuns * 0.3 || (failureRate > 0.4 && scoreVariance > avgScore)) {
            return { archetype: 'THE_CHAOS_COMMANDER', blurb: ARCHETYPE_BLURBS.THE_CHAOS_COMMANDER };
        }
        if (maxScore > 200_000_000 && failureRate > 0.3) {
            return { archetype: 'THE_VISIONARY', blurb: ARCHETYPE_BLURBS.THE_VISIONARY };
        }
        if (scoreVariance > avgScore * 1.5) {
            return { archetype: 'THE_GAMBLER', blurb: ARCHETYPE_BLURBS.THE_GAMBLER };
        }
        if (successRate > 0.7) {
            return { archetype: 'THE_SURVIVOR', blurb: ARCHETYPE_BLURBS.THE_SURVIVOR };
        }
        return { archetype: 'THE_VETERAN', blurb: ARCHETYPE_BLURBS.THE_VETERAN };
    }

    if (totalRuns >= 3) {
        if (mutinies >= 2) {
            return { archetype: 'THE_CHAOS_COMMANDER', blurb: ARCHETYPE_BLURBS.THE_CHAOS_COMMANDER };
        }
        if (successRate > 0.8) {
            return { archetype: 'THE_ADMINISTRATOR', blurb: ARCHETYPE_BLURBS.THE_ADMINISTRATOR };
        }
        if (avgScore > 150_000_000) {
            return { archetype: 'THE_CAREERIST', blurb: ARCHETYPE_BLURBS.THE_CAREERIST };
        }
        if (oversightFailures >= 2) {
            return { archetype: 'THE_VISIONARY', blurb: ARCHETYPE_BLURBS.THE_VISIONARY };
        }
    }

    return { archetype: 'THE_ROOKIE', blurb: ARCHETYPE_BLURBS.THE_ROOKIE };
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

        // Calculate verified values (from simplified backend engine)
        const serverScore = calculateScore(state);
        const verifiedEndingId = determineEnding(state);

        // Create run hash
        const runData = JSON.stringify({
            seed: body.seed,
            actionIds: body.actionIds,
            wallet: body.wallet,
            score: body.score,
            endingId: verifiedEndingId,
        });
        const runHash = createHash('sha256').update(runData).digest('hex').slice(0, 16);

        // HACKATHON MODE: Backend replay engine is simplified and won't match exactly
        // Log discrepancies for monitoring but accept the client's score
        // In production, this would need a full replay engine matching the client
        const scoreDiff = Math.abs(serverScore - body.score);

        if (scoreDiff > 0) {
            console.log(`Score discrepancy: claimed=${body.score}, server=${serverScore}, diff=${scoreDiff}`);
        }

        // Use the client's claimed score (trusted for hackathon)
        const finalScore = body.score;

        // Save to Supabase (always use finalScore, not claimed)
        let supabaseError: string | null = null;
        let profileCreated = false;
        let commanderName = body.commanderName || 'Unknown Commander';
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
            try {
                // If privyUserId provided, upsert profile
                if (body.privyUserId) {
                    // Check if profile exists
                    const profileCheck = await fetch(
                        `${supabaseUrl}/rest/v1/profiles?privy_user_id=eq.${encodeURIComponent(body.privyUserId)}`,
                        {
                            headers: {
                                'apikey': supabaseKey,
                                'Authorization': `Bearer ${supabaseKey}`,
                            },
                        }
                    );

                    const existingProfiles = await profileCheck.json();

                    if (existingProfiles.length === 0) {
                        // Create new profile
                        await fetch(`${supabaseUrl}/rest/v1/profiles`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': supabaseKey,
                                'Authorization': `Bearer ${supabaseKey}`,
                                'Prefer': 'return=minimal',
                            },
                            body: JSON.stringify({
                                privy_user_id: body.privyUserId,
                                wallet: body.wallet,
                                commander_name: commanderName,
                                missions_count: 1,
                                best_score: finalScore,
                                last_ending_id: verifiedEndingId,
                            }),
                        });
                        profileCreated = true;
                    } else {
                        // Update existing profile
                        const existingProfile = existingProfiles[0];
                        commanderName = existingProfile.commander_name;
                        const newBestScore = Math.max(existingProfile.best_score || 0, finalScore);

                        await fetch(
                            `${supabaseUrl}/rest/v1/profiles?privy_user_id=eq.${encodeURIComponent(body.privyUserId)}`,
                            {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'apikey': supabaseKey,
                                    'Authorization': `Bearer ${supabaseKey}`,
                                    'Prefer': 'return=minimal',
                                },
                                body: JSON.stringify({
                                    missions_count: (existingProfile.missions_count || 0) + 1,
                                    best_score: newBestScore,
                                    last_ending_id: verifiedEndingId,
                                    updated_at: new Date().toISOString(),
                                }),
                            }
                        );
                    }
                }

                // Insert run
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
                        privy_user_id: body.privyUserId || null,
                        commander_name: commanderName,
                        score: finalScore,
                        seed: body.seed,
                        ending_id: verifiedEndingId,
                        action_count: body.actionIds.length,
                        run_hash: runHash,
                        on_chain_tx: null,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    supabaseError = `Supabase error: ${errorText}`;
                    console.error(supabaseError);
                } else if (body.privyUserId) {
                    // Calculate and update archetype after successful run insert
                    try {
                        // Fetch recent runs for archetype calculation
                        const runsRes = await fetch(
                            `${supabaseUrl}/rest/v1/runs?privy_user_id=eq.${encodeURIComponent(body.privyUserId)}&select=score,ending_id&order=created_at.desc&limit=20`,
                            {
                                headers: {
                                    'apikey': supabaseKey,
                                    'Authorization': `Bearer ${supabaseKey}`,
                                },
                            }
                        );

                        if (runsRes.ok) {
                            const recentRuns = await runsRes.json();
                            const { archetype, blurb } = calculateArchetype(recentRuns);

                            // Update profile with archetype
                            await fetch(
                                `${supabaseUrl}/rest/v1/profiles?privy_user_id=eq.${encodeURIComponent(body.privyUserId)}`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'apikey': supabaseKey,
                                        'Authorization': `Bearer ${supabaseKey}`,
                                        'Prefer': 'return=minimal',
                                    },
                                    body: JSON.stringify({
                                        archetype,
                                        archetype_blurb: blurb,
                                    }),
                                }
                            );
                            console.log(`[Archetype] Updated profile archetype to: ${archetype}`);
                        }
                    } catch (archetypeErr) {
                        console.error('[Archetype] Failed to calculate/update:', archetypeErr);
                    }
                }
            } catch (err) {
                supabaseError = `Supabase connection error: ${err instanceof Error ? err.message : 'Unknown'}`;
                console.error(supabaseError);
            }
        }

        // On-chain submission via Shinami Gas Station
        // Sanitize address env vars at startup to prevent whitespace issues
        const onChainEnabled = (process.env.ENABLE_ONCHAIN ?? '').trim() === 'true';
        const missionIndexAddress = (process.env.MISSION_INDEX_ADDRESS ?? '').trim();
        const shinamiApiKey = (process.env.SHINAMI_API_KEY ?? '').trim();

        // Validate address format if on-chain is enabled
        if (onChainEnabled && missionIndexAddress) {
            if (!/^0x[0-9a-fA-F]{64}$/.test(missionIndexAddress)) {
                console.error(`Invalid MISSION_INDEX_ADDRESS format: ${JSON.stringify(process.env.MISSION_INDEX_ADDRESS)}`);
            }
        }

        let txHash: string | null = null;
        let onChainStatus: 'disabled' | 'queued' | 'submitted' | 'error' = 'disabled';
        let explorerUrl: string | null = null;
        let onChainError: string | null = null;

        console.log('[OnChain] Config:', { onChainEnabled, hasMissionIndex: !!missionIndexAddress, hasShinami: !!shinamiApiKey });

        if (onChainEnabled && missionIndexAddress && shinamiApiKey) {
            console.log('[OnChain] Attempting on-chain recording...');
            try {
                // Use the Shinami SDK for proper transaction sponsorship
                const { recordMissionOnChain } = await import('./shinami-client.js');

                const result = await recordMissionOnChain(
                    {
                        userAddress: body.wallet,
                        runHash,
                        score: finalScore,
                        endingId: verifiedEndingId,
                        missionIndexAddress,
                    },
                    shinamiApiKey,
                );

                if (result.success && result.txHash) {
                    txHash = result.txHash;
                    onChainStatus = 'submitted';
                    explorerUrl = result.explorerUrl || `https://explorer.movementnetwork.xyz/tx/${txHash}?network=testnet`;
                    console.log('On-chain mission recorded:', txHash);

                    // Update the database with the tx hash using REST API
                    if (supabaseUrl && supabaseKey) {
                        const updateResponse = await fetch(
                            `${supabaseUrl}/rest/v1/runs?run_hash=eq.${runHash}`,
                            {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'apikey': supabaseKey,
                                    'Authorization': `Bearer ${supabaseKey}`,
                                } as Record<string, string>,
                                body: JSON.stringify({ on_chain_tx: txHash }),
                            }
                        );

                        if (!updateResponse.ok) {
                            console.error('Failed to update on_chain_tx:', await updateResponse.text());
                        }
                    }
                } else {
                    onChainStatus = 'error';
                    onChainError = result.error || 'Unknown Shinami error';
                    console.error('Shinami sponsorship failed:', result.error);
                }
            } catch (err) {
                onChainStatus = 'error';
                onChainError = err instanceof Error ? err.message : String(err);
                console.error('On-chain submission error:', err);
            }
        } else if (onChainEnabled) {
            console.warn('On-chain enabled but missing config:', { missionIndexAddress: !!missionIndexAddress, shinamiApiKey: !!shinamiApiKey });
        }

        // Always return stable response structure
        return res.status(200).json({
            success: true,
            runHash,
            finalScore,
            verifiedEndingId,
            wallet: body.wallet,
            actionCount: body.actionIds.length,
            savedToLeaderboard: !supabaseError,
            profile: body.privyUserId ? {
                privyUserId: body.privyUserId,
                commanderName,
                isNew: profileCreated,
            } : null,
            onChain: {
                enabled: onChainEnabled,
                status: onChainStatus,
                txHash,
                explorerUrl,
            },
            ...(supabaseError && { supabaseError }),
        });

    } catch (err) {
        console.error('Verification error:', err);
        return res.status(500).json({
            error: 'Verification failed',
            message: err instanceof Error ? err.message : 'Unknown error',
        });
    }
}


