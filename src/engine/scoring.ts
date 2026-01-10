import type { GameState } from "./state";

// Operative Combos - bonus multipliers for specific playstyles
export interface OperativeCombo {
    id: string;
    name: string;
    emoji: string;
    description: string;
    multiplier: number;
    check: (state: GameState) => boolean;
}

// Helper to check if player used specific actions
function hasAction(state: GameState, ...actionIds: string[]): boolean {
    return actionIds.some(id => state.usedActionIds.includes(id));
}

function countActions(state: GameState, ...actionIds: string[]): number {
    return state.usedActionIds.filter(id => actionIds.includes(id)).length;
}

export const OPERATIVE_COMBOS: OperativeCombo[] = [
    {
        id: "propaganda_master",
        name: "Communications Master",
        emoji: "📣",
        description: "Launched mascot, morale campaign, and research announcement",
        multiplier: 1.15,
        check: (state) => {
            return hasAction(state, "mascot_campaign") &&
                hasAction(state, "morale_event") &&
                hasAction(state, "publish_findings");
        },
    },
    {
        id: "bureaucracy_expert",
        name: "Bureaucracy Expert",
        emoji: "📋",
        description: "Mastered protocols, delegate programs, and crew assemblies",
        multiplier: 1.10,
        check: (state) => {
            return hasAction(state, "suspend_protocols") &&
                hasAction(state, "delegate_authority") &&
                hasAction(state, "crew_assembly");
        },
    },
    {
        id: "sponsor_diplomat",
        name: "Sponsor Diplomat",
        emoji: "🤝",
        description: "Successfully managed Earth communications 3+ times",
        multiplier: 1.08,
        check: (state) => {
            return countActions(state, "earth_partnership", "investor_briefing", "earth_broadcast") >= 3;
        },
    },
    {
        id: "technically_compliant",
        name: "Technically Compliant",
        emoji: "📑",
        description: "Resource allocation + systems audit + legal counsel",
        multiplier: 1.05,
        check: (state) => {
            return hasAction(state, "resource_reallocation") &&
                hasAction(state, "systems_audit");
        },
    },
    {
        id: "risk_commander",
        name: "Risk Commander",
        emoji: "👑",
        description: "Survived 5+ crises while building >50% of reserves as legacy",
        multiplier: 1.20,
        check: (state) => {
            return state.crisisCount >= 5 && state.legacy > state.colonyReserves * 0.5;
        },
    },
    {
        id: "reputation_destroyer",
        name: "Reputation Destroyer",
        emoji: "😈",
        description: "Silenced critics, exposed detractors, blamed equipment",
        multiplier: 1.12,
        check: (state) => {
            return countActions(state, "expose_critic", "blame_equipment", "counter_narrative") >= 2;
        },
    },
    {
        id: "narrative_architect",
        name: "Narrative Architect",
        emoji: "🏛️",
        description: "Research pivots, infrastructure announcements, breakthrough claims",
        multiplier: 1.15,
        check: (state) => {
            const narrativeActions = [
                "mission_pivot",
                "infrastructure_announcement",
                "breakthrough_claim",
                "terraforming_preview",
                "tech_milestone"
            ];
            return countActions(state, ...narrativeActions) >= 3;
        },
    },
    {
        id: "crisis_survivor",
        name: "Crisis Survivor",
        emoji: "🔥",
        description: "Survived 8+ critical incidents",
        multiplier: 1.25,
        check: (state) => state.crisisCount >= 8,
    },
    {
        id: "extraction_specialist",
        name: "Legacy Maximalist",
        emoji: "💰",
        description: "Used 6+ different legacy-building methods",
        multiplier: 1.18,
        check: (state) => {
            const legacyActions = [
                "mining_acceleration", "external_contractors", "commander_bonus",
                "discretionary_budget", "private_reserve", "luxury_habitat",
                "resource_speculation", "research_grant", "emergency_reserves",
                "private_shipment"
            ];
            const uniqueLegacy = new Set(state.usedActionIds.filter(id => legacyActions.includes(id)));
            return uniqueLegacy.size >= 6;
        },
    },
    {
        id: "audit_dodger",
        name: "Audit Survivor",
        emoji: "🕵️",
        description: "High scrutiny risk (>0.5) but survived the mission",
        multiplier: 1.15,
        check: (state) => {
            const survived = state.turn >= state.maxTurns;
            return survived && state.hidden.scrutiny > 0.5;
        },
    },
];

// Legacy alias for compatibility
export type DegenCombo = OperativeCombo;
export const DEGEN_COMBOS = OPERATIVE_COMBOS;

export function calculateFinalScore(state: GameState): {
    baseScore: number;
    combos: { combo: DegenCombo; applied: boolean }[];
    totalMultiplier: number;
    finalScore: number;
} {
    const baseScore = state.legacy;
    const combos = DEGEN_COMBOS.map((combo) => ({
        combo,
        applied: combo.check(state),
    }));
    const totalMultiplier = combos
        .filter((c) => c.applied)
        .reduce((mult, c) => mult * c.combo.multiplier, 1);

    // Strategic Efficiency Bonuses
    let strategyMult = 1.0;
    if (state.colonyReserves > 500_000_000) strategyMult *= 1.1; // Prosperity
    if (state.rage < 20) strategyMult *= 1.1;                    // Popularity
    if (state.oversightPressure < 30) strategyMult *= 1.1;       // Stability
    if (state.rage > 80) strategyMult *= 0.8;                    // Discord penalty

    const survivalBonus = state.turn >= state.maxTurns ? 1.25 : 1;
    const finalScore = Math.floor(baseScore * totalMultiplier * strategyMult * survivalBonus);

    return {
        baseScore,
        combos,
        totalMultiplier: totalMultiplier * strategyMult * survivalBonus,
        finalScore,
    };
}

export function formatScore(score: number): string {
    if (score >= 1_000_000_000) {
        return `$${(score / 1_000_000_000).toFixed(2)}B`;
    }
    if (score >= 1_000_000) {
        return `$${(score / 1_000_000).toFixed(2)}M`;
    }
    if (score >= 1_000) {
        return `$${(score / 1_000).toFixed(1)}K`;
    }
    return `$${score}`;
}
