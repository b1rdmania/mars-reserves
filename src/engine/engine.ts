import type { GameState } from "./state";
import type { ActionId } from "./actions";
import { ACTIONS } from "./actions";
import { pickRandomEvent } from "./events";
import { maybePickCrisis } from "./crises";
import type { RNG } from "./rng";
import { getSeason } from "./seasons";
import type { SeasonId } from "./seasons";
import { rollSeverity } from "./severity";
import { sampleActionsForTurn } from "./actions";

function applyMarketDrift(state: GameState, rng: RNG): GameState {
  const noise = (rng() - 0.5) * 0.08; // -4%..+4%
  const hypePush = (state.techHype - 50) / 200; // approx -0.25..+0.25
  const fearDrag = (state.rage + state.heat - 100) / 300; // drag when combined >100
  const priceDelta = noise + hypePush - fearDrag;
  let tokenPrice = Math.max(0.05, state.tokenPrice * (1 + priceDelta));
  if (tokenPrice > state.tokenPrice * 1.25) tokenPrice = state.tokenPrice * 1.25;
  if (tokenPrice < state.tokenPrice * 0.75) tokenPrice = state.tokenPrice * 0.75;

  const sentiment = (100 - state.rage + state.cred) / 200;
  const tvlNoise = (rng() - 0.5) * 0.1;
  let tvl = state.tvl * (1 + priceDelta * 0.5 + tvlNoise * sentiment);
  tvl = Math.max(0, tvl);

  return { ...state, tokenPrice, tvl };
}

function applyDrift(state: GameState, rng: RNG): GameState {
  const season = getSeason(state.seasonId);
  // baseline drift; season deltas tweak these
  const rage = state.rage - 2 + (season.rageDecayDelta ?? 0);
  const heat = state.heat - 1 + (season.heatDriftDelta ?? 0);
  const techHype = state.techHype - 3 + (season.techHypeDecayDelta ?? 0);
  const cred = state.cred - 1 - (season.credDecayDelta ?? 0);
  let next: GameState = {
    ...state,
    rage: Math.max(0, rage),
    heat: Math.max(0, heat),
    techHype: Math.max(0, techHype),
    cred: Math.max(0, cred),
  };
  next = applyMarketDrift(next, rng);
  return next;
}

function checkGameOver(state: GameState): GameState {
  if (state.gameOver) return state;
  if (state.rage >= 100) {
    return { ...state, gameOver: true, gameOverReason: "DAO coup: community overthrew you." };
  }
  if (state.heat >= 100) {
    return { ...state, gameOver: true, gameOverReason: "Regulatory shutdown: treasury frozen." };
  }
  if (state.cred <= 0) {
    return { ...state, gameOver: true, gameOverReason: "Credibility collapse: nobody believes you." };
  }
  if (state.officialTreasury <= 0) {
    return { ...state, gameOver: true, gameOverReason: "Official treasury empty: no more games to play." };
  }
  if (state.turn >= 50) {
    return {
      ...state,
      gameOver: true,
      gameOverReason: "Regime change: your era is over after 50 governance cycles.",
    };
  }
  return state;
}

export function initialState(params?: {
  chainName?: string;
  founderName?: string;
  ticker?: string;
  seasonId?: SeasonId;
}): GameState {
  const { chainName = "ZooChain", founderName = "You", ticker = "ZOO", seasonId = "meme_summer" } = params ?? {};
  return {
    turn: 0,
    chainName,
    founderName,
    ticker: ticker.toUpperCase().slice(0, 4),
    tokenPrice: 1,
    tvl: 5_000_000_000,
    officialTreasury: 1_000_000_000,
    siphoned: 0,
    rage: 20,
    heat: 10,
    cred: 60,
    techHype: 40,
    seasonId,
    hidden: {
      auditRisk: 0,
      founderStability: 1,
      communityMemory: 0,
    },
    log: ["Welcome to The Treasury Game."],
    recentEvents: [],
    gameOver: false,
  };
}

export function step(state: GameState, actionId: ActionId, rng: RNG): GameState {
  if (state.gameOver) return state;
  if (state.pendingCrisis) return state; // must resolve crisis first

  let next = { ...state, turn: state.turn + 1 };
  const season = getSeason(state.seasonId);

  const available = sampleActionsForTurn(state, rng);
  const action = available.find((a) => a.id === actionId) ?? ACTIONS.find((a) => a.id === actionId);
  if (action) {
    const severity = rollSeverity(rng);
    const before = { ...next };
    next = action.apply(next);

    // apply severity scaling to key meters
    const scale = severity.multiplier;
    const applyScale = (val: number, base: number) => base + (val - base) * scale;
    next = {
      ...next,
      rage: applyScale(next.rage, before.rage),
      heat: applyScale(next.heat, before.heat),
      cred: applyScale(next.cred, before.cred),
      techHype: applyScale(next.techHype, before.techHype),
      officialTreasury: applyScale(next.officialTreasury, before.officialTreasury),
      siphoned: applyScale(next.siphoned, before.siphoned),
      log: [
        `${severity.label} (${severity.roll}/6) → ${action.name}`,
        ...next.log,
      ],
    };
  }

  next = applyDrift(next, rng);

  if (!next.pendingCrisis) {
    const crisis = maybePickCrisis(next, rng, season);
    if (crisis) {
      next = {
        ...next,
        pendingCrisis: crisis,
        log: [`Crisis triggered: ${crisis.name}`, ...next.log],
      };
    }
  }

  const ev = pickRandomEvent(next, rng, season);
  if (ev) {
    next = ev.apply(next);
  }

  next = checkGameOver(next);
  return next;
}

