// Mars Reserves Theme Configuration
// Maps internal state keys to player-facing display names

export const THEME = {
  gameName: "Move: Mars Reserves",
  tagline: "Build your legacy on Mars",

  // Metric display names
  metrics: {
    colonyReserves: "Colony Stockpile",
    legacy: "Legacy Capital",
    rage: "Crew Unrest",
    oversightPressure: "Earth Oversight",
    cred: "Command Trust",
    techHype: "Research Momentum",
  },

  // Hidden metric display names (for debug/tooltips)
  hiddenMetrics: {
    scrutiny: "Oversight Scrutiny",
    founderStability: "Command Composure",
    communityMemory: "Institutional Memory",
    reserveLiquidity: "Resource Stability",
  },

  // Category names
  categories: {
    Ambition: "Legacy Projects",
    Command: "Command Authority",
    Communications: "Strategic Communications",
    "Crisis Response": "Crisis Management",
    "Crew Relations": "Personnel Relations",
  } as Record<string, string>,

  // UI copy
  ui: {
    startButton: "Begin Mission",
    endTurn: "Next Cycle",
    gameOver: "Mission Complete",
    recordMission: "Record to Archive",
    leaderboard: "Colony Archive",
    howToPlay: "Mission Briefing",
    turn: "Cycle",
    score: "Legacy Capital",
  },

  // Flavor text
  flavor: {
    intro: "You are the Colony Commander of humanity's first permanent Mars settlement.",
    mandate: "Build your personal legacy—facilities bearing your name, discoveries credited to you, institutional power that outlasts your tenure—while keeping the colony alive.",
    ending: "Your mission is complete. History will judge what you built.",
  },
} as const;

// Helper to get metric display name
export function getMetricName(key: string): string {
  const metrics = THEME.metrics as Record<string, string>;
  const hidden = THEME.hiddenMetrics as Record<string, string>;
  return metrics[key] ?? hidden[key] ?? key;
}

// Helper to get category display name
export function getCategoryName(category: string): string {
  return THEME.categories[category] ?? category;
}
