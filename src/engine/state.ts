import type { CrisisDef } from "./crises";

export type Meter = "officialTreasury" | "siphoned" | "rage" | "heat" | "cred" | "techHype";

export interface HiddenState {
  auditRisk: number;
  founderStability: number;
  communityMemory: number;
  stablecoinRatio: number; // 0-1: portion of treasury in stablecoins (default 0.3)
}

export interface GameState {
  turn: number;
  maxTurns: number;
  chainName: string;
  founderName: string;
  ticker: string;
  availableActions: string[];
  tokenPrice: number; // e.g. 1.0
  tvl: number; // total value locked (USD)
  officialTreasury: number; // protocol treasury (USD)
  siphoned: number; // off-chain for founder
  rage: number; // 0–100
  heat: number; // 0–100
  cred: number; // 0–100
  techHype: number; // 0–100
  seasonId: string;
  hidden: HiddenState;
  log: string[];
  recentEvents: string[];
  gameOver: boolean;
  gameOverReason?: string;
  pendingCrisis?: CrisisDef;
}

