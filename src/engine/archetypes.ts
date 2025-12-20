/**
 * Commander Archetype System
 * Calculates a commander's archetype based on their mission history.
 * Archetypes provide narrative flavor and personality to career records.
 */

export type ArchetypeId =
    | 'THE_CAREERIST'
    | 'THE_ADMINISTRATOR'
    | 'THE_CHAOS_COMMANDER'
    | 'THE_VISIONARY'
    | 'THE_SURVIVOR'
    | 'THE_GAMBLER'
    | 'THE_ROOKIE'
    | 'THE_VETERAN';

export interface Archetype {
    id: ArchetypeId;
    label: string;
    blurb: string;
}

// Archetype definitions with labels and blurbs
const ARCHETYPES: Record<ArchetypeId, Archetype> = {
    THE_CAREERIST: {
        id: 'THE_CAREERIST',
        label: 'The Careerist',
        blurb: 'High legacy, frequent oversight failures. Earth knows your name—for better or worse.',
    },
    THE_ADMINISTRATOR: {
        id: 'THE_ADMINISTRATOR',
        label: 'The Administrator',
        blurb: 'Steady hands, stable colony. Not exciting, but the crew sleeps well.',
    },
    THE_CHAOS_COMMANDER: {
        id: 'THE_CHAOS_COMMANDER',
        label: 'The Chaos Commander',
        blurb: 'Mutinies, close calls, wild swings. Your missions make for excellent documentaries.',
    },
    THE_VISIONARY: {
        id: 'THE_VISIONARY',
        label: 'The Visionary',
        blurb: 'Big ambitions, mixed results. History will judge whether you were ahead of your time.',
    },
    THE_SURVIVOR: {
        id: 'THE_SURVIVOR',
        label: 'The Survivor',
        blurb: 'Against all odds, you keep coming back. The colony endures.',
    },
    THE_GAMBLER: {
        id: 'THE_GAMBLER',
        label: 'The Gambler',
        blurb: 'High risk, high variance. Some runs legendary, others best forgotten.',
    },
    THE_ROOKIE: {
        id: 'THE_ROOKIE',
        label: 'The Rookie',
        blurb: 'New to command. Every mission is a learning experience.',
    },
    THE_VETERAN: {
        id: 'THE_VETERAN',
        label: 'The Veteran',
        blurb: 'Many missions under your belt. You\'ve seen it all.',
    },
};

// Ending categories for archetype calculation
const FAILURE_ENDINGS = ['crew_mutiny', 'earth_recall', 'trust_collapse', 'reserves_depleted'];
const SUCCESS_ENDINGS = ['legendary_commander', 'successful_mission', 'modest_legacy', 'survived'];
const OVERSIGHT_ENDINGS = ['earth_recall'];
const MUTINY_ENDINGS = ['crew_mutiny'];

interface RunData {
    score: number;
    ending_id: string;
}

/**
 * Calculate archetype based on mission history
 * @param runs Array of run records (most recent first)
 * @returns Archetype ID and blurb
 */
export function calculateArchetype(runs: RunData[]): { archetype: ArchetypeId; blurb: string } {
    // Default for new players
    if (runs.length === 0) {
        return { archetype: 'THE_ROOKIE', blurb: ARCHETYPES.THE_ROOKIE.blurb };
    }

    if (runs.length === 1) {
        return { archetype: 'THE_ROOKIE', blurb: ARCHETYPES.THE_ROOKIE.blurb };
    }

    // Calculate statistics
    const totalRuns = runs.length;
    const scores = runs.map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / totalRuns;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const scoreVariance = maxScore - minScore;

    // Count endings by category
    const failures = runs.filter(r => FAILURE_ENDINGS.includes(r.ending_id)).length;
    const successes = runs.filter(r => SUCCESS_ENDINGS.includes(r.ending_id)).length;
    const oversightFailures = runs.filter(r => OVERSIGHT_ENDINGS.includes(r.ending_id)).length;
    const mutinies = runs.filter(r => MUTINY_ENDINGS.includes(r.ending_id)).length;

    const failureRate = failures / totalRuns;
    const successRate = successes / totalRuns;

    // Veteran threshold
    if (totalRuns >= 10) {
        // Check specific patterns for veterans

        // The Careerist: High legacy + frequent oversight failures
        if (avgScore > 100_000_000 && oversightFailures >= totalRuns * 0.3) {
            return { archetype: 'THE_CAREERIST', blurb: ARCHETYPES.THE_CAREERIST.blurb };
        }

        // The Administrator: Low failures, consistent performance
        if (failureRate < 0.2 && scoreVariance < avgScore * 0.5) {
            return { archetype: 'THE_ADMINISTRATOR', blurb: ARCHETYPES.THE_ADMINISTRATOR.blurb };
        }

        // The Chaos Commander: Many mutinies and high variance
        if (mutinies >= totalRuns * 0.3 || (failureRate > 0.4 && scoreVariance > avgScore)) {
            return { archetype: 'THE_CHAOS_COMMANDER', blurb: ARCHETYPES.THE_CHAOS_COMMANDER.blurb };
        }

        // The Visionary: High max score but mixed results
        if (maxScore > 200_000_000 && failureRate > 0.3) {
            return { archetype: 'THE_VISIONARY', blurb: ARCHETYPES.THE_VISIONARY.blurb };
        }

        // The Gambler: High variance
        if (scoreVariance > avgScore * 1.5) {
            return { archetype: 'THE_GAMBLER', blurb: ARCHETYPES.THE_GAMBLER.blurb };
        }

        // The Survivor: Mostly made it through
        if (successRate > 0.7) {
            return { archetype: 'THE_SURVIVOR', blurb: ARCHETYPES.THE_SURVIVOR.blurb };
        }

        // Default veteran
        return { archetype: 'THE_VETERAN', blurb: ARCHETYPES.THE_VETERAN.blurb };
    }

    // Mid-career (3-9 runs)
    if (totalRuns >= 3) {
        if (mutinies >= 2) {
            return { archetype: 'THE_CHAOS_COMMANDER', blurb: ARCHETYPES.THE_CHAOS_COMMANDER.blurb };
        }

        if (successRate > 0.8) {
            return { archetype: 'THE_ADMINISTRATOR', blurb: ARCHETYPES.THE_ADMINISTRATOR.blurb };
        }

        if (avgScore > 150_000_000) {
            return { archetype: 'THE_CAREERIST', blurb: ARCHETYPES.THE_CAREERIST.blurb };
        }

        if (oversightFailures >= 2) {
            return { archetype: 'THE_VISIONARY', blurb: ARCHETYPES.THE_VISIONARY.blurb };
        }
    }

    // Still a rookie
    return { archetype: 'THE_ROOKIE', blurb: ARCHETYPES.THE_ROOKIE.blurb };
}

// Export archetype definitions for UI
export { ARCHETYPES };
