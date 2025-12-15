import type { GameState } from "./state";

export interface EndingDef {
    id: string;
    category: "mission" | "crew" | "command" | "oversight" | "legacy" | "style";
    emoji: string;
    headline: string;
    subline: string;
    narrative: string;
    trigger: (state: GameState) => boolean;
    weight: number;
    badge?: string;
    scoreMultiplier?: number;
}

// Helper to count action types in log
function countActionsInLog(log: string[], pattern: RegExp): number {
    return log.filter(l => pattern.test(l)).length;
}

// Helper to check if survived
function survived(state: GameState): boolean {
    return state.turn >= state.maxTurns;
}

// Helper to check failure type
function failedBy(state: GameState, type: "rage" | "heat" | "cred" | "treasury"): boolean {
    const reason = state.gameOverReason?.toLowerCase() ?? "";
    switch (type) {
        case "rage": return reason.includes("mutiny") || reason.includes("coup") || state.rage >= 100;
        case "heat": return reason.includes("oversight") || reason.includes("recall") || state.heat >= 100;
        case "cred": return reason.includes("trust") || reason.includes("believes") || state.cred <= 0;
        case "treasury": return reason.includes("reserves") || reason.includes("empty") || state.officialTreasury <= 0;
    }
}

export const ENDINGS: EndingDef[] = [
    // ============================================
    // A. MISSION SUCCESS ENDINGS
    // ============================================
    {
        id: "golden_age",
        category: "mission",
        emoji: "🚀",
        headline: "The Golden Age",
        subline: "Colony expansion accelerated beyond all projections.",
        narrative: "Your strange announcement was interpreted as discovery confirmation. Investment surged. You're now too wealthy to pretend to care about operations.",
        trigger: (s) => survived(s) && s.tokenPrice > 3 && s.techHype > 70,
        weight: 10,
        badge: "Architect",
        scoreMultiplier: 1.5,
    },
    {
        id: "resource_collapse",
        category: "mission",
        emoji: "💨",
        headline: "Resource Collapse",
        subline: "Extraction depleted critical reserves.",
        narrative: "One calculation error, and your entire resource base evaporated. You blame solar interference. Nobody believes you, but also nobody can verify it.",
        trigger: (s) => s.tokenPrice < 0.2 && s.tvl < 50_000_000,
        weight: 15,
        badge: "Depletion Architect",
    },
    {
        id: "life_support_failure",
        category: "mission",
        emoji: "📉",
        headline: "Life Support Cascade",
        subline: "Critical systems failed in sequence.",
        narrative: "That integration seemed fine. It was not fine. Emergency reserves are gone. You announce a 'mental health leave.'",
        trigger: (s) => s.officialTreasury < 100_000_000 && s.tokenPrice < 0.3 && s.cred < 20,
        weight: 12,
        badge: "System Failure",
    },
    {
        id: "broadcast_misread",
        category: "mission",
        emoji: "📡",
        headline: "Broadcasting Disaster",
        subline: "Your message was completely misinterpreted.",
        narrative: "Your ironic 'mission complete' broadcast triggered evacuation protocols. Crew thinks you abandoned them. You didn't, but explaining makes it worse.",
        trigger: (s) => failedBy(s, "rage") && s.techHype > 40,
        weight: 10,
        badge: "Comms Failure",
    },
    {
        id: "extraction_bankruptcy",
        category: "mission",
        emoji: "⛏️",
        headline: "Extraction Drove Bankruptcy",
        subline: "You paid everything for equipment that produced nothing.",
        narrative: "The yield projections were optimistic. Fourteen equipment contracts extracted everything from your reserves. They thanked you before the recall.",
        trigger: (s) => s.officialTreasury < 50_000_000 && s.siphoned < 100_000_000,
        weight: 8,
        badge: "Over-Invested",
    },

    // ============================================
    // B. CREW / SOCIAL ENDINGS
    // ============================================
    {
        id: "earth_cancels",
        category: "crew",
        emoji: "🧵",
        headline: "Earth Cut You Off",
        subline: "A comprehensive exposé changed everything.",
        narrative: "Your personal quarters images. Your allocation discrepancies. Your old statements about 'crew efficiency.' You go silent and hide in the hab.",
        trigger: (s) => failedBy(s, "cred") && s.rage < 70 && s.heat < 70,
        weight: 5,
        badge: "Main Character (Negative)",
    },
    {
        id: "replaced_by_junior",
        category: "crew",
        emoji: "👤",
        headline: "Replaced by Junior Officer",
        subline: "Crew elected a popular subordinate.",
        narrative: "They chose Lt. Chen over you. Qualifications: crew loyalty and consistent communication. 'Time for new leadership,' you announce bitterly.",
        trigger: (s) => failedBy(s, "rage") && s.cred < 25 && s.techHype < 50,
        weight: 8,
        badge: "Outvoted",
    },
    {
        id: "humiliation_cascade",
        category: "crew",
        emoji: "📢",
        headline: "Public Humiliation",
        subline: "One broadcast ended it all.",
        narrative: "Your final message got 3 supporters and 2,400 critics. Each response was worse than the last. You announce you're 'focusing on operations.'",
        trigger: (s) => failedBy(s, "cred") && s.rage > 50,
        weight: 12,
        badge: "Terminal Ratio",
    },
    {
        id: "deepfake_scandal",
        category: "crew",
        emoji: "🎭",
        headline: "Fabricated Evidence Scandal",
        subline: "A manipulated recording of you 'confessing' went viral.",
        narrative: "It was obviously fake. The voice was wrong. Nobody cared. 'Guilty until proven innocent' hits different in deep space.",
        trigger: (s) => failedBy(s, "cred") && s.heat > 40,
        weight: 10,
        badge: "Framed",
    },
    {
        id: "become_legend",
        category: "crew",
        emoji: "🎪",
        headline: "You Became a Legend",
        subline: "Crew ironically loves you now.",
        narrative: "Your failures are so consistent, they're beloved. The colony becomes a running joke. Your face is on unofficial patches. Somehow, this is winning.",
        trigger: (s) => survived(s) && s.cred < 40 && s.siphoned > 100_000_000,
        weight: 8,
        badge: "Living Legend",
        scoreMultiplier: 1.2,
    },

    // ============================================
    // C. COMMAND / INTERNAL ENDINGS
    // ============================================
    {
        id: "full_mutiny",
        category: "command",
        emoji: "⚔️",
        headline: "Full Crew Mutiny",
        subline: "Your team took control without you.",
        narrative: "They took command, the comms, and the landing authority. You're now 'Founder Emeritus (Ceremonial)' of nothing.",
        trigger: (s) => failedBy(s, "rage") && s.cred < 35,
        weight: 12,
        badge: "Deposed",
    },
    {
        id: "systems_locked",
        category: "command",
        emoji: "🔐",
        headline: "Critical Systems Locked",
        subline: "Authorization frozen. Operations halted.",
        narrative: "One officer went silent. Then another. The reserves are technically still there. Nobody can access them. 'Lost authorization, lost mission.'",
        trigger: (s) => s.officialTreasury > 300_000_000 && s.tokenPrice < 0.4 && !survived(s),
        weight: 6,
        badge: "Access Denied",
    },
    {
        id: "officer_reveal",
        category: "command",
        emoji: "👻",
        headline: "Officer Identity Scandal",
        subline: "Your XO was... not who you thought.",
        narrative: "Turns out your trusted officer was either unqualified, underage, or your relative using false credentials. Trust: instantly 0.",
        trigger: (s) => failedBy(s, "cred") && s.turn < 10,
        weight: 5,
        badge: "Betrayed by Trust",
    },
    {
        id: "ai_takeover",
        category: "command",
        emoji: "🤖",
        headline: "AI Assumed Command",
        subline: "They literally installed an AI as commander.",
        narrative: "Proposal #847: 'Replace commander with automated systems.' Passed unanimously. The AI's first act: restrict your access. 'Automated leadership transition complete.'",
        trigger: (s) => failedBy(s, "rage") && s.techHype > 50,
        weight: 10,
        badge: "AI Replaced",
    },
    {
        id: "accounting_error",
        category: "command",
        emoji: "🧮",
        headline: "Critical Misaccounting",
        subline: "Auditors found... discrepancies.",
        narrative: "Turns out you were off by a factor of 1000. Somewhere. The report is 847 pages. 'In hindsight, decimal places matter.'",
        trigger: (s) => s.siphoned > 200_000_000 && s.officialTreasury < 100_000_000,
        weight: 8,
        badge: "Decimal Disaster",
    },

    // ============================================
    // D. OVERSIGHT / REGULATORY ENDINGS
    // ============================================
    {
        id: "formal_inquiry",
        category: "oversight",
        emoji: "💌",
        headline: "Earth Sent Formal Inquiry",
        subline: "A strongly-worded request ended everything.",
        narrative: "It was polite. Professional. Devastating. Personal liability avoided thanks to 'unclear jurisdiction.' The mission is done though.",
        trigger: (s) => failedBy(s, "heat") && s.rage < 70 && s.cred > 20,
        weight: 5,
        badge: "Inquiry Recipient",
    },
    {
        id: "forced_evacuation",
        category: "oversight",
        emoji: "✈️",
        headline: "Forced Evacuation",
        subline: "Earth oversight got aggressive.",
        narrative: "First they recalled the finances. Then the equipment. Then you. 'Returning for consultation,' you broadcast from the escape pod.",
        trigger: (s) => s.heat > 80 && survived(s),
        weight: 10,
        badge: "Jurisdiction Hopper",
        scoreMultiplier: 0.9,
    },
    {
        id: "mission_termination",
        category: "oversight",
        emoji: "🚫",
        headline: "Mission Termination Order",
        subline: "Earth pulled the plug overnight.",
        narrative: "NASA. ESA. JAXA. All support gone by morning. 'Mission parameters no longer meet operational needs,' they said. Your comms are chaos.",
        trigger: (s) => s.heat > 60 && s.tokenPrice < 0.6,
        weight: 15,
        badge: "Terminated",
    },
    {
        id: "audit_inquiry",
        category: "oversight",
        emoji: "📋",
        headline: "Finance Authority Questions",
        subline: "They inquired about 'operational expenses.'",
        narrative: "The message was brief. 'Please explain allocations 1 through 847.' You did not reply. Your location is now 'in transit.'",
        trigger: (s) => s.siphoned > 150_000_000 && s.heat > 60,
        weight: 8,
        badge: "Resource Optimiser",
    },
    {
        id: "whistleblower",
        category: "oversight",
        emoji: "🐀",
        headline: "You Became a Whistleblower",
        subline: "You testified against your own mission.",
        narrative: "For immunity benefits, you revealed everything. First-commander-ever-to-snitch status earned. Crew will never forgive you. Worth it?",
        trigger: (s) => s.heat > 90 && s.siphoned > 100_000_000 && !survived(s),
        weight: 5,
        badge: "Crown Witness",
    },

    // ============================================
    // E. LEGACY / SUCCESS ENDINGS
    // ============================================
    {
        id: "research_pivot_works",
        category: "legacy",
        emoji: "🧠",
        headline: "Research Pivot Worked",
        subline: "Your programs started advancing the mission themselves.",
        narrative: "You pivoted to pure research as a distraction. Then breakthroughs happened. Value exploded. They don't need you anymore. Colony thrives.",
        trigger: (s) => survived(s) && s.techHype > 80 && s.tokenPrice > 1.5,
        weight: 8,
        badge: "Research Transcended",
        scoreMultiplier: 1.3,
    },
    {
        id: "side_project_success",
        category: "legacy",
        emoji: "🌱",
        headline: "Side Project Overtook Main Mission",
        subline: "Crew abandoned primary objectives for your pet project.",
        narrative: "You launched a terraforming experiment as a hobby. It's now 10× more valuable than main ops. Everyone forgot what your mission actually was. 'Accidental success.'",
        trigger: (s) => survived(s) && s.cred < 50 && s.siphoned > 50_000_000,
        weight: 10,
        badge: "Side Quest Success",
        scoreMultiplier: 1.1,
    },
    {
        id: "corporate_partnership",
        category: "legacy",
        emoji: "🏢",
        headline: "Corporate Partnership Went Viral",
        subline: "You accidentally attracted major Earth investment.",
        narrative: "The pilot program was supposed to be quiet. Major outlets picked it up. Now you're doing investor calls. 'Corporate synergy transition complete.'",
        trigger: (s) => survived(s) && s.cred > 70 && s.tvl > 400_000_000,
        weight: 6,
        badge: "Enterprise Commander",
        scoreMultiplier: 1.4,
    },
    {
        id: "isolation_lock",
        category: "legacy",
        emoji: "🔒",
        headline: "Colony Isolated Permanently",
        subline: "Nobody can leave. Colony became self-sufficient.",
        narrative: "The return systems were 'paused' to... never restart. Everyone's stuck forever. 'Permanent settlement achieved,' you joke. Nobody laughs.",
        trigger: (s) => s.tvl < 30_000_000 && s.rage > 70 && !survived(s),
        weight: 7,
        badge: "Warden",
    },
    {
        id: "perfect_mission",
        category: "legacy",
        emoji: "🌈",
        headline: "Perfect Mission",
        subline: "Everything aligned beautifully.",
        narrative: "Momentum exploded. Earth looked away. Crew forgave your methods. Value pumped. You walk away clean. This never happens. You got lucky.",
        trigger: (s) => survived(s) && s.rage < 30 && s.heat < 30 && s.cred > 60 && s.siphoned > 150_000_000,
        weight: 5,
        badge: "MISSION COMPLETE",
        scoreMultiplier: 1.5,
    },

    // ============================================
    // F. PLAYER-STYLE SPECIFIC ENDINGS
    // ============================================
    {
        id: "master_extractor",
        category: "style",
        emoji: "💎",
        headline: "Master Extractor",
        subline: "You extracted >70% of colony reserves.",
        narrative: "Seven hundred million in legacy value. Gone. Into permanent record. Nobody caught you. You retire to Earth luxury. Legend status unlocked.",
        trigger: (s) => survived(s) && s.siphoned > 700_000_000,
        weight: 20,
        badge: "Legacy Maximalist",
        scoreMultiplier: 2.0,
    },
    {
        id: "bureaucracy_master",
        category: "style",
        emoji: "🎭",
        headline: "Bureaucracy Master",
        subline: "You confused everyone with procedures.",
        narrative: "Directive after directive. Review after review. Nobody understood what passed. The colony holds a festival in your honor for 'creative process management.'",
        trigger: (s) => {
            const govActions = countActionsInLog(s.log, /command|directive|assembly|delegate|protocol/i);
            return survived(s) && govActions >= 5;
        },
        weight: 15,
        badge: "Process Maximalist",
        scoreMultiplier: 1.15,
    },
    {
        id: "communications_wizard",
        category: "style",
        emoji: "✨",
        headline: "Communications Wizard",
        subline: "You kept momentum above 80 the whole time.",
        narrative: "Breakthrough this. Discovery that. Progress everything. You shipped nothing but vibes. Somehow, it worked. You become a full-time 'visionary.'",
        trigger: (s) => survived(s) && s.techHype > 80,
        weight: 12,
        badge: "Thought Leader",
        scoreMultiplier: 1.2,
    },
    {
        id: "crisis_survivor",
        category: "style",
        emoji: "🔥",
        headline: "Crisis Survivor",
        subline: "You survived 8+ crises.",
        narrative: "Failures. Malfunctions. Scandals. Rumors. You faced them all and somehow lived. You now tour Earth teaching 'mission resilience.' Ironic, since you caused most of them.",
        trigger: (s) => {
            const crisisCount = countActionsInLog(s.log, /crisis|triggered/i);
            return survived(s) && crisisCount >= 8;
        },
        weight: 10,
        badge: "Chaos Surfer",
        scoreMultiplier: 1.25,
    },
    {
        id: "ironic_award",
        category: "style",
        emoji: "🏅",
        headline: "Commander of the Year (Ironically)",
        subline: "You did everything wrong but survived anyway.",
        narrative: "Low trust. High oversight. Angry crew. Yet here you are. Earth awards you an ironically prestigious title. You can't tell if it's a diss.",
        trigger: (s) => survived(s) && s.cred < 40 && s.heat > 50 && s.siphoned > 100_000_000,
        weight: 8,
        badge: "Irony Award Winner",
        scoreMultiplier: 1.1,
    },
];

// Evaluate which ending applies using weighted random selection
export function evaluateEnding(state: GameState): EndingDef | null {
    const matching = ENDINGS.filter(e => e.trigger(state));
    if (matching.length === 0) return null;

    // If only one matches, return it
    if (matching.length === 1) return matching[0];

    // Weighted random selection - higher weights are more likely but not guaranteed
    const totalWeight = matching.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const ending of matching) {
        roll -= ending.weight;
        if (roll <= 0) return ending;
    }

    // Fallback to first matching (shouldn't happen)
    return matching[0];
}

// Get a fallback ending based on basic game state (for when no special ending triggers)
export function getFallbackEnding(state: GameState): EndingDef {
    const survived_game = state.turn >= state.maxTurns;
    const bigBag = state.siphoned > 200_000_000;

    if (survived_game && bigBag) {
        return {
            id: "fallback_success",
            category: "style",
            emoji: "🎯",
            headline: "Mission Complete",
            subline: "You survived the mission. Time for that Earth mansion.",
            narrative: "Twenty cycles of chaos. Somehow you made it. The legacy is secured. The next transport leaves in an hour.",
            trigger: () => true,
            weight: 0,
        };
    }

    if (survived_game) {
        return {
            id: "fallback_survive",
            category: "style",
            emoji: "😐",
            headline: "Survived... Barely",
            subline: "You made it out, but barely.",
            narrative: "Could have been worse. Could have been better. At least you're not under investigation.",
            trigger: () => true,
            weight: 0,
        };
    }

    // Failed - generic ending
    return {
        id: "fallback_failed",
        category: "style",
        emoji: "💀",
        headline: "Mission Failed",
        subline: "Your command has ended.",
        narrative: state.gameOverReason ?? "The mission is over.",
        trigger: () => true,
        weight: 0,
    };
}
