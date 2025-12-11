export interface SeverityResult {
  roll: number; // 1–6
  label: "Glancing" | "Normal" | "Critical";
  multiplier: number;
}

export function rollSeverity(rng: () => number): SeverityResult {
  const roll = Math.floor(rng() * 6) + 1;
  if (roll === 6) return { roll, label: "Critical", multiplier: 1.35 };
  if (roll >= 4) return { roll, label: "Normal", multiplier: 1.0 };
  return { roll, label: "Glancing", multiplier: 0.7 };
}


