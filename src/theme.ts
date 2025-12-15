// Mars Reserves Theme Configuration
// Maps internal state keys to player-facing display names

export const THEME = {
  gameName: "Move: Mars Reserves",
  tagline: "A strategy game about scarce resources on Mars",

  // Metric display names
  metrics: {
    officialTreasury: "Colony Reserves",
    siphoned: "Legacy Score",
    rage: "Crew Unrest",
    heat: "Earth Oversight",
    cred: "Command Trust",
    techHype: "Research Momentum",
  },

  // Hidden metric display names (for debug/tooltips)
  hiddenMetrics: {
    auditRisk: "System Strain",
    founderStability: "Commander Stress",
    communityMemory: "Colony Memory",
    stablecoinRatio: "Resource Diversity",
  },

  // Category names (remap from crypto to colony ops)
  categories: {
    Siphon: "Extraction",
    Governance: "Command",
    Narrative: "Communications",
    "Damage Control": "Crisis Response",
    Social: "Crew Relations",
  } as Record<string, string>,

  // UI copy
  ui: {
    startButton: "Begin Mission",
    endTurn: "Next Cycle",
    gameOver: "Mission Complete",
    recordMission: "Record Mission",
    leaderboard: "Colony Index",
    howToPlay: "Mission Briefing",
    turn: "Cycle",
    score: "Legacy Score",
  },

  // Flavor text
  flavor: {
    intro: "You are the Commander of humanity's first permanent Mars colony.",
    mandate: "Extract as much legacy value as possible within 20 mission cycles, without triggering mutiny, mission shutdown, or catastrophic failure.",
    ending: "Your mission is complete. History will remember what you built.",
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
