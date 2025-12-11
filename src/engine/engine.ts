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
  const sentiment = (state.cred - state.rage + state.techHype) / 300; // -1..1 ish
  const baseDrift = sentiment * 0.05;
  const vol =
    state.seasonId === "meme_summer"
      ? 0.2
      : state.seasonId === "regulator_season"
      ? 0.08
      : 0.15;
  const noise = (rng() - 0.5) * vol;
  const priceDelta = baseDrift + noise;
  let tokenPrice = Math.max(0.01, state.tokenPrice * (1 + priceDelta));
  if (tokenPrice > state.tokenPrice * 1.10) tokenPrice = state.tokenPrice * 1.10;
  if (tokenPrice < state.tokenPrice * 0.90) tokenPrice = state.tokenPrice * 0.90;
  const realizedDelta = (tokenPrice - state.tokenPrice) / state.tokenPrice;

  const tvlSentiment = (100 - state.rage + state.cred) / 200;
  const tvlNoise = (rng() - 0.5) * 0.1;
  let tvl = state.tvl * (1 + realizedDelta * 0.5 + tvlNoise * tvlSentiment);
  tvl = Math.max(0, tvl);

  // 50% of treasury is native token; adjust that portion by price movement
  const nativePortion = state.officialTreasury * 0.5;
  const stablePortion = state.officialTreasury - nativePortion;
  const adjustedNative = nativePortion * (1 + realizedDelta);
  const officialTreasury = Math.max(0, stablePortion + adjustedNative);

  return { ...state, tokenPrice, tvl, officialTreasury };
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
  if (state.turn >= state.maxTurns) {
    return {
      ...state,
      gameOver: true,
      gameOverReason: `Regime change: your era is over after ${state.maxTurns} governance cycles.`,
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
    maxTurns: 20,
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
    availableActions: [],
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

  const availableIds = state.availableActions.length
    ? state.availableActions
    : sampleActionsForTurn(state, rng).map((a) => a.id);
  const availableDefs = ACTIONS.filter((a) => availableIds.includes(a.id));
  const action = availableDefs.find((a) => a.id === actionId) ?? ACTIONS.find((a) => a.id === actionId);
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
      log: [`${severity.label} → ${action.name}`, ...next.log],
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

  // sample next turn's actions
  const nextActions = sampleActionsForTurn(next, rng).map((a) => a.id);
  next = { ...next, availableActions: nextActions };

  next = checkGameOver(next);
  return next;
}

