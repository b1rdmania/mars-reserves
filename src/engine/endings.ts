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
        case "heat": return reason.includes("oversight") || reason.includes("recall") || state.oversightPressure >= 100;
        case "cred": return reason.includes("trust") || reason.includes("believes") || state.cred <= 0;
        case "treasury": return reason.includes("reserves") || reason.includes("empty") || state.colonyReserves <= 0;
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
        headline: "ARCHITECT OF THE RED CENTURY",
        subline: "Your ambition aligned with survival. Mars endured.",
        narrative: "The colony expanded beyond projections. Resources flowed. Your name appears in founding documents, dedication plaques, and the historical record. The mission succeeded—and so did you.",
        trigger: (s) => survived(s) && s.cred > 70 && s.techHype > 70,
        weight: 10,
        badge: "Founding Architect",
        scoreMultiplier: 1.5,
    },
    {
        id: "resource_collapse",
        category: "mission",
        emoji: "💨",
        headline: "RESOURCE COLLAPSE",
        subline: "Extraction depleted critical reserves.",
        narrative: "One calculation error, and your entire resource base evaporated. You blame solar interference. Nobody believes you, but also nobody can verify it.",
        trigger: (s) => s.colonyReserves < 100_000_000 && s.techHype < 30,
        weight: 15,
        badge: "Depletion Architect",
    },
    {
        id: "life_support_failure",
        category: "mission",
        emoji: "📉",
        headline: "LIFE SUPPORT CASCADE",
        subline: "Critical systems failed in sequence.",
        narrative: "That integration seemed fine. It was not fine. Emergency reserves are gone. You announce a 'mental health leave.'",
        trigger: (s) => s.colonyReserves < 100_000_000 && s.oversightPressure > 50 && s.cred < 20,
        weight: 12,
        badge: "System Failure",
    },
    {
        id: "broadcast_misread",
        category: "mission",
        emoji: "📡",
        headline: "BROADCASTING DISASTER",
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
        headline: "EXTRACTION DROVE BANKRUPTCY",
        subline: "You paid everything for equipment that produced nothing.",
        narrative: "The yield projections were optimistic. Fourteen equipment contracts extracted everything from your reserves. They thanked you before the recall.",
        trigger: (s) => s.colonyReserves < 50_000_000 && s.legacy < 100_000_000,
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
        headline: "EARTH CUT YOU OFF",
        subline: "A comprehensive exposé changed everything.",
        narrative: "Your personal quarters images. Your allocation discrepancies. Your old statements about 'crew efficiency.' You go silent and hide in the hab.",
        trigger: (s) => failedBy(s, "cred") && s.rage < 70 && s.oversightPressure < 70,
        weight: 5,
        badge: "Main Character (Negative)",
    },
    {
        id: "replaced_by_junior",
        category: "crew",
        emoji: "👤",
        headline: "REPLACED BY JUNIOR OFFICER",
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
        headline: "PUBLIC HUMILIATION",
        subline: "One broadcast ended it all.",
        narrative: "Your final message got 3 supporters and 2,400 critics. Each response was worse than the last. You announce you're 'focusing on operations.'",
        trigger: (s) => failedBy(s, "cred") && s.rage > 50,
        weight: 12,
        badge: "Public Disgrace",
    },
    {
        id: "deepfake_scandal",
        category: "crew",
        emoji: "🎭",
        headline: "FABRICATED EVIDENCE SCANDAL",
        subline: "A manipulated recording of you 'confessing' circulated widely.",
        narrative: "It was obviously fake. The voice was wrong. Nobody cared. 'Guilty until proven innocent' hits different in deep space.",
        trigger: (s) => failedBy(s, "cred") && s.oversightPressure > 40,
        weight: 10,
        badge: "Framed",
    },
    {
        id: "become_legend",
        category: "crew",
        emoji: "🎪",
        headline: "YOU BECAME A LEGEND",
        subline: "Crew ironically loves you now.",
        narrative: "Your failures are so consistent, they're beloved. The colony becomes a running joke. Your face is on unofficial patches. Somehow, this is winning.",
        trigger: (s) => survived(s) && s.cred < 40 && s.legacy > 100_000_000,
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
        headline: "FULL CREW MUTINY",
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
        headline: "CRITICAL SYSTEMS LOCKED",
        subline: "Authorization frozen. Operations halted.",
        narrative: "One officer went silent. Then another. The reserves are technically still there. Nobody can access them. 'Lost authorization, lost mission.'",
        trigger: (s) => s.colonyReserves > 300_000_000 && s.cred < 30 && !survived(s),
        weight: 6,
        badge: "Access Denied",
    },
    {
        id: "officer_reveal",
        category: "command",
        emoji: "👻",
        headline: "OFFICER IDENTITY SCANDAL",
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
        headline: "AI ASSUMED COMMAND",
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
        headline: "CRITICAL MISACCOUNTING",
        subline: "Auditors found... discrepancies.",
        narrative: "Turns out you were off by a factor of 1000. Somewhere. The report is 847 pages. 'In hindsight, decimal places matter.'",
        trigger: (s) => s.legacy > 200_000_000 && s.colonyReserves < 100_000_000,
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
        headline: "EARTH SENT FORMAL INQUIRY",
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
        headline: "FORCED EVACUATION",
        subline: "Earth oversight got aggressive.",
        narrative: "First they recalled the finances. Then the equipment. Then you. 'Returning for consultation,' you broadcast from the escape pod.",
        trigger: (s) => s.oversightPressure > 80 && survived(s),
        weight: 10,
        badge: "Jurisdiction Hopper",
        scoreMultiplier: 0.9,
    },
    {
        id: "mission_termination",
        category: "oversight",
        emoji: "🚫",
        headline: "MISSION TERMINATION ORDER",
        subline: "Earth pulled the plug overnight.",
        narrative: "NASA. ESA. JAXA. All support gone by morning. 'Mission parameters no longer meet operational needs,' they said. Your comms are chaos.",
        trigger: (s) => s.oversightPressure > 60 && s.cred < 40,
        weight: 15,
        badge: "Terminated",
    },
    {
        id: "audit_inquiry",
        category: "oversight",
        emoji: "📋",
        headline: "FINANCE AUTHORITY QUESTIONS",
        subline: "They inquired about 'operational expenses.'",
        narrative: "The message was brief. 'Please explain allocations 1 through 847.' You did not reply. Your location is now 'in transit.'",
        trigger: (s) => s.legacy > 150_000_000 && s.oversightPressure > 60,
        weight: 8,
        badge: "Resource Optimiser",
    },
    {
        id: "whistleblower",
        category: "oversight",
        emoji: "🐀",
        headline: "YOU BECAME A WHISTLEBLOWER",
        subline: "You testified against your own mission.",
        narrative: "For immunity benefits, you revealed everything. First-commander-ever-to-snitch status earned. Crew will never forgive you. Worth it?",
        trigger: (s) => s.oversightPressure > 90 && s.legacy > 100_000_000 && !survived(s),
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
        headline: "RESEARCH PIVOT WORKED",
        subline: "Your programs started advancing the mission themselves.",
        narrative: "You pivoted to pure research as a distraction. Then breakthroughs happened. Mission output grew. They don't need you anymore. Colony thrives.",
        trigger: (s) => survived(s) && s.techHype > 80 && s.cred > 60,
        weight: 8,
        badge: "Research Transcended",
        scoreMultiplier: 1.3,
    },
    {
        id: "side_project_success",
        category: "legacy",
        emoji: "🌱",
        headline: "SIDE PROJECT OVERTOOK MAIN MISSION",
        subline: "Crew abandoned primary objectives for your pet project.",
        narrative: "You launched a terraforming experiment as a hobby. It's now 10× more valuable than main ops. Everyone forgot what your mission actually was. 'Accidental success.'",
        trigger: (s) => survived(s) && s.cred < 50 && s.legacy > 50_000_000,
        weight: 10,
        badge: "Side Quest Success",
        scoreMultiplier: 1.1,
    },
    {
        id: "corporate_partnership",
        category: "legacy",
        emoji: "🏢",
        headline: "EARTH UNDERWRITERS FORMALISE SUPPORT",
        subline: "You attracted major institutional investment.",
        narrative: "The pilot program was supposed to be quiet. Major agencies took notice. Now you're briefing sponsors. 'Strategic partnership transition complete.'",
        trigger: (s) => survived(s) && s.cred > 70 && s.colonyReserves > 400_000_000,
        weight: 6,
        badge: "Enterprise Commander",
        scoreMultiplier: 1.4,
    },
    {
        id: "isolation_lock",
        category: "legacy",
        emoji: "🔒",
        headline: "COLONY ISOLATED PERMANENTLY",
        subline: "Nobody can leave. Colony became self-sufficient.",
        narrative: "The return systems were 'paused' to... never restart. Everyone's stuck forever. 'Permanent settlement achieved,' you joke. Nobody laughs.",
        trigger: (s) => s.colonyReserves < 50_000_000 && s.rage > 70 && !survived(s),
        weight: 7,
        badge: "Warden",
    },
    {
        id: "perfect_mission",
        category: "legacy",
        emoji: "🌈",
        headline: "THE COMPLETE COMMANDER",
        subline: "Mission success. Personal legacy secured. No compromises.",
        narrative: "Earth oversight remained low. Crew morale held. The colony thrived—and your contributions are permanently documented in the colony charter. Historians will note: this rarely happens.",
        trigger: (s) => survived(s) && s.rage < 30 && s.oversightPressure < 30 && s.cred > 60 && s.legacy > 150_000_000,
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
        headline: "THE [YOUR NAME] ERA",
        subline: "Your legacy dominates the colony's institutional memory.",
        narrative: "Seven hundred million in legacy capital. Facilities, discoveries, processes—all bearing your imprint. The colony will remember your name for centuries. Whether fondly remains unclear.",
        trigger: (s) => survived(s) && s.legacy > 700_000_000,
        weight: 20,
        badge: "Legacy Maximalist",
        scoreMultiplier: 2.0,
    },
    {
        id: "bureaucracy_master",
        category: "style",
        emoji: "🎭",
        headline: "BUREAUCRACY MASTER",
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
        headline: "COMMUNICATIONS WIZARD",
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
        headline: "CRISIS SURVIVOR",
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
        headline: "COMMANDER OF THE YEAR (PROVISIONAL)",
        subline: "Despite everything, the mission concluded.",
        narrative: "Trust eroded. Oversight intensified. Crew complaints multiplied. Yet here you stand—mission complete, legacy secured. Earth awards you an ambiguously-worded commendation.",
        trigger: (s) => survived(s) && s.cred < 40 && s.oversightPressure > 50 && s.legacy > 100_000_000,
        weight: 8,
        badge: "Provisional Commendation",
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
    const largeLegacy = state.legacy > 200_000_000;

    if (survived_game && largeLegacy) {
        return {
            id: "fallback_success",
            category: "style",
            emoji: "🎯",
            headline: "MISSION COMPLETE",
            subline: "You survived the mission. Your departure transport awaits.",
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
            headline: "SURVIVED... BARELY",
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
        headline: "MISSION FAILED",
        subline: "Your command has ended.",
        narrative: state.gameOverReason ?? "The mission is over.",
        trigger: () => true,
        weight: 0,
    };
}
