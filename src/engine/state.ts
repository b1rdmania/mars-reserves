import type { CrisisDef } from "./crises";

export type Meter = "colonyReserves" | "legacy" | "rage" | "oversightPressure" | "cred" | "techHype";

export interface HiddenState {
  scrutiny: number;           // Was scrutiny
  founderStability: number;
  communityMemory: number;
  reserveLiquidity: number;
}

export interface GameState {
  turn: number;
  maxTurns: number;
  chainName: string;
  founderName: string;
  ticker: string;
  availableActions: string[];
  usedActionIds: string[];
  crisisCount: number;
  tokenPrice: number;
  tvl: number;
  colonyReserves: number;     // Was colonyReserves
  legacy: number;             // Was siphoned — your historical footprint
  rage: number;               // Crew unrest (0–100)
  oversightPressure: number;  // Was heat — Earth oversight (0–100)
  cred: number;               // Command trust (0–100)
  techHype: number;           // Research momentum (0–100)
  seasonId: string;
  hidden: HiddenState;
  log: string[];
  recentEvents: string[];
  gameOver: boolean;
  gameOverReason?: string;
  pendingCrisis?: CrisisDef;
}


