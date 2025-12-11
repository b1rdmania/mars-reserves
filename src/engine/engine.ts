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
  // VOLATILE PRICE MODEL
  // Rage and low cred/tech cause MASSIVE dips
  // High tech and cred can boost price

  // Sentiment factors (each contributes to price pressure)
  const ragePressure = state.rage > 70 ? -0.15 : state.rage > 50 ? -0.08 : state.rage > 30 ? -0.03 : 0;
  const credPressure = state.cred < 30 ? -0.12 : state.cred < 50 ? -0.05 : state.cred > 70 ? 0.05 : 0;
  const techPressure = state.techHype < 20 ? -0.08 : state.techHype > 60 ? 0.08 : state.techHype > 40 ? 0.03 : 0;

  // Combined sentiment (-0.35 to +0.16 range)
  const sentiment = ragePressure + credPressure + techPressure;

  // Base volatility by season
  const baseVol = state.seasonId === "meme_summer" ? 0.25
    : state.seasonId === "regulator_season" ? 0.12
      : state.seasonId === "builder_winter" ? 0.15
        : 0.20;

  // Extra volatility when things are bad
  const panicVol = state.rage > 70 || state.cred < 30 ? 0.15 : 0;
  const vol = baseVol + panicVol;

  // Random noise
  const noise = (rng() - 0.5) * vol;

  // Total price change (can be extreme: -50% to +25% in bad conditions)
  const priceDelta = sentiment + noise;

  // Apply price change - NO CAPS for extreme moves
  let tokenPrice = Math.max(0.001, state.tokenPrice * (1 + priceDelta));

  // Realized delta for treasury calc
  const realizedDelta = (tokenPrice - state.tokenPrice) / state.tokenPrice;

  // TVL affected by price and sentiment
  const tvlSentiment = (100 - state.rage + state.cred + state.techHype) / 300;
  const tvlNoise = (rng() - 0.5) * 0.15;
  // TVL moves with price but also has its own momentum
  let tvl = state.tvl * (1 + realizedDelta * 0.7 + tvlNoise * tvlSentiment);
  tvl = Math.max(10_000_000, tvl); // Floor at 10M

  // 70% of treasury is native token - heavily affected by price
  const nativeRatio = 0.7;
  const nativePortion = state.officialTreasury * nativeRatio;
  const stablePortion = state.officialTreasury * (1 - nativeRatio);
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
    tvl: 500_000_000,
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

