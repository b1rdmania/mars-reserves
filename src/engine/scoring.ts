import type { GameState } from "./state";

export interface DegenCombo {
    id: string;
    name: string;
    emoji: string;
    description: string;
    multiplier: number;
    check: (state: GameState) => boolean;
}

export const DEGEN_COMBOS: DegenCombo[] = [
    {
        id: "meme_god",
        name: "Meme God",
        emoji: "🎉",
        description: "Launched mascot, meme coin, and AI pivot",
        multiplier: 1.15,
        check: (state) => {
            const log = state.log.join(" ").toLowerCase();
            const hasMascot = log.includes("mascot") || log.includes("meme");
            const hasMemeCoin = log.includes("meme coin") || log.includes("degens swarm");
            const hasAIPivot = log.includes("ai") && (log.includes("pivot") || log.includes("zkvm"));
            return hasMascot && hasMemeCoin && hasAIPivot;
        },
    },
    {
        id: "governance_theater",
        name: "Governance Theater Enjoyer",
        emoji: "🤡",
        description: "Froze governance, emergency emissions, delegate program",
        multiplier: 1.10,
        check: (state) => {
            const log = state.log.join(" ").toLowerCase();
            const hasFreeze = log.includes("governance paused") || log.includes("froze");
            const hasEmissions = log.includes("emissions") || log.includes("printed");
            const hasDelegate = log.includes("delegate") || log.includes("influencers to vote");
            return hasFreeze && hasEmissions && hasDelegate;
        },
    },
    {
        id: "whale_whisperer",
        name: "Whale Whisperer",
        emoji: "🐋",
        description: "Successfully DM'd whales, avoided dumps",
        multiplier: 1.08,
        check: (state) => {
            const log = state.log.join(" ").toLowerCase();
            const hasWhaleDM = log.includes("whale") && (log.includes("dm") || log.includes("reassured"));
            const noDump = !log.includes("whale dump") && !log.includes("market sold");
            return hasWhaleDM && noDump;
        },
    },
    {
        id: "technically_legal",
        name: "Technically Not Illegal",
        emoji: "🧰",
        description: "Treasury diversification, OTC deals, MEV extraction",
        multiplier: 1.05,
        check: (state) => {
            const log = state.log.join(" ").toLowerCase();
            const hasDiversification = log.includes("diversif");
            const hasOTC = log.includes("otc");
            const hasMEV = log.includes("mev") || log.includes("sandwich");
            return (hasDiversification || hasOTC) && (hasOTC || hasMEV);
        },
    },
    {
        id: "degen_royalty",
        name: "Degen Royalty",
        emoji: "👑",
        description: "Survived legendary crises while siphoning massively",
        multiplier: 1.20,
        check: (state) => {
            const log = state.log.join(" ").toLowerCase();
            const survivedLegendary = log.includes("legendary") || log.includes("cnbc") || log.includes("exploit") || log.includes("delisting");
            const bigSiphon = state.siphoned > state.officialTreasury * 0.5;
            return survivedLegendary && bigSiphon;
        },
    },
    {
        id: "ct_villain",
        name: "CT Villain Arc",
        emoji: "😈",
        description: "Ratio'd people, screenshot shamed, attacked sleuths",
        multiplier: 1.12,
        check: (state) => {
            const log = state.log.join(" ").toLowerCase();
            const hasRatio = log.includes("ratio");
            const hasShame = log.includes("screenshot") || log.includes("exposed");
            const hasAttack = log.includes("attack") && (log.includes("sleuth") || log.includes("credibility"));
            return (hasRatio && hasShame) || (hasRatio && hasAttack) || (hasShame && hasAttack);
        },
    },
    {
        id: "narrative_master",
        name: "Narrative Master",
        emoji: "📣",
        description: "ZK, DePIN, RWA, and Institutions Soon all in one run",
        multiplier: 1.15,
        check: (state) => {
            const log = state.log.join(" ").toLowerCase();
            const hasZK = log.includes("zk") || log.includes("zero knowledge");
            const hasDePIN = log.includes("depin") || log.includes("physical infrastructure");
            const hasRWA = log.includes("rwa") || log.includes("real-world asset");
            const hasInstitutions = log.includes("institution");
            let count = 0;
            if (hasZK) count++;
            if (hasDePIN) count++;
            if (hasRWA) count++;
            if (hasInstitutions) count++;
            return count >= 3;
        },
    },
];

export function calculateFinalScore(state: GameState): {
    baseScore: number;
    combos: { combo: DegenCombo; applied: boolean }[];
    totalMultiplier: number;
    finalScore: number;
} {
    // Base score is siphoned amount
    const baseScore = state.siphoned;

    // Check which combos apply
    const combos = DEGEN_COMBOS.map((combo) => ({
        combo,
        applied: combo.check(state),
    }));

    // Calculate total multiplier
    const totalMultiplier = combos
        .filter((c) => c.applied)
        .reduce((mult, c) => mult * c.combo.multiplier, 1);

    // Apply bonus for surviving all turns
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
