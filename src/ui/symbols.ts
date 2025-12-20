/**
 * Game Symbol Vocabulary
 * 
 * A fixed set of 6 glyphs used consistently throughout the game.
 * These are SYMBOLS, not emojis — they communicate specific meanings.
 */

// Core symbol vocabulary - use these ONLY
export const SYMBOLS = {
    // Extraction / Ambition actions
    EXTRACTION: '⛏',

    // Crisis / Risk / Warning
    WARNING: '⚠',

    // Oversight / Earth / External pressure
    OVERSIGHT: '🛰',

    // Research / Momentum / Discovery
    RESEARCH: '🧪',

    // Crew / Trust / People
    CREW: '🧑‍🚀',

    // Time / Cycles / Duration
    TIME: '⏳',
} as const;

// Action category symbol mapping
export const ACTION_SYMBOLS: Record<string, string> = {
    ambition: SYMBOLS.EXTRACTION,
    command: SYMBOLS.OVERSIGHT,
    research: SYMBOLS.RESEARCH,
    operations: SYMBOLS.TIME,
    informal: SYMBOLS.CREW,
};

// Meter symbol mapping
export const METER_SYMBOLS: Record<string, string> = {
    unrest: SYMBOLS.CREW,
    oversight: SYMBOLS.OVERSIGHT,
    trust: SYMBOLS.CREW,
    momentum: SYMBOLS.RESEARCH,
};

// Classification labels for action annotations
export const CLASSIFICATIONS: Record<string, string> = {
    ambition: 'NON-STANDARD',
    command: 'AUTHORIZED',
    research: 'LOGGED',
    operations: 'OVERRIDE',
    informal: 'INFORMAL',
};

// Filing categories for procedural annotations
export const FILING_CATEGORIES: Record<string, string> = {
    ambition: 'SPECIAL PROJECTS',
    command: 'COMMAND LOG',
    research: 'SCIENCE DIVISION',
    operations: 'CRISIS RESPONSE',
    informal: 'PERSONNEL FILE',
};
