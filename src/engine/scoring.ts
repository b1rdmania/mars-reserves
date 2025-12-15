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
        name: "Propaganda Master",
        emoji: "📣",
        description: "Launched mascot, morale campaign, and research pivot",
        multiplier: 1.15,
        check: (state) => {
            return hasAction(state, "launch_mascot") &&
                hasAction(state, "meme_coin_launch") &&
                hasAction(state, "ai_pivot");
        },
    },
    {
        id: "bureaucracy_expert",
        name: "Bureaucracy Expert",
        emoji: "📋",
        description: "Mastered committee delays, emergency protocols, delegate programs",
        multiplier: 1.10,
        check: (state) => {
            return hasAction(state, "freeze_governance") &&
                hasAction(state, "emergency_emissions_vote") &&
                hasAction(state, "delegate_program");
        },
    },
    {
        id: "sponsor_diplomat",
        name: "Sponsor Diplomat",
        emoji: "🤝",
        description: "Successfully negotiated with Earth sponsors 3+ times",
        multiplier: 1.08,
        check: (state) => {
            return countActions(state, "dm_whale_reassurance", "whale_early_access") >= 3;
        },
    },
    {
        id: "technically_compliant",
        name: "Technically Compliant",
        emoji: "📑",
        description: "Resource diversification + off-book deals + extraction optimization",
        multiplier: 1.05,
        check: (state) => {
            return hasAction(state, "treasury_diversification") &&
                hasAction(state, "mev_sandwich_fund");
        },
    },
    {
        id: "risk_commander",
        name: "Risk Commander",
        emoji: "👑",
        description: "Survived 5+ crises while extracting >50% of reserves",
        multiplier: 1.20,
        check: (state) => {
            return state.crisisCount >= 5 && state.siphoned > state.officialTreasury * 0.5;
        },
    },
    {
        id: "reputation_destroyer",
        name: "Reputation Destroyer",
        emoji: "😈",
        description: "Silenced critics, deflected blame, attacked investigators",
        multiplier: 1.12,
        check: (state) => {
            return countActions(state, "screenshot_shame", "attack_sleuth_credibility", "ratio_fud") >= 2;
        },
    },
    {
        id: "narrative_architect",
        name: "Narrative Architect",
        emoji: "🏛️",
        description: "Research pivots, infrastructure announcements, contractor partnerships",
        multiplier: 1.15,
        check: (state) => {
            const narrativeActions = [
                "zk_pivot_announcement",
                "depin_announcement",
                "rwa_tokenization_angle",
                "institutions_soon",
                "ai_pivot"
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
        name: "Extraction Specialist",
        emoji: "💰",
        description: "Used 6+ different resource extraction methods",
        multiplier: 1.18,
        check: (state) => {
            const siphonActions = [
                "siphon_advisory", "strategic_consultants", "founder_wage_increase",
                "expense_account", "family_office_vehicle", "real_estate_hq",
                "token_buyback", "foundation_grant", "treasury_diversification",
                "mev_sandwich_fund"
            ];
            const uniqueSiphons = new Set(state.usedActionIds.filter(id => siphonActions.includes(id)));
            return uniqueSiphons.size >= 6;
        },
    },
    {
        id: "audit_dodger",
        name: "Audit Survivor",
        emoji: "🕵️",
        description: "High investigation risk (>0.5) but never got caught",
        multiplier: 1.15,
        check: (state) => {
            const survived = state.turn >= state.maxTurns;
            return survived && state.hidden.auditRisk > 0.5;
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
    const baseScore = state.siphoned;
    const combos = DEGEN_COMBOS.map((combo) => ({
        combo,
        applied: combo.check(state),
    }));
    const totalMultiplier = combos
        .filter((c) => c.applied)
        .reduce((mult, c) => mult * c.combo.multiplier, 1);
    const survivalBonus = state.turn >= state.maxTurns ? 1.25 : 1;
    const finalScore = Math.floor(baseScore * totalMultiplier * survivalBonus);

    return {
        baseScore,
        combos,
        totalMultiplier: totalMultiplier * survivalBonus,
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
