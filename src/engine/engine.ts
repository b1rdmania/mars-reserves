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
  // BALANCED PRICE MODEL v2
  // More symmetric pressure: good play can pump, bad play dumps
  // Price has momentum to reduce wild swings

  // Sentiment factors - REBALANCED for fairness (-28% to +21%)
  // Low rage now gives POSITIVE pressure (reward for keeping community happy)
  const ragePressure = state.rage > 80 ? -0.12 : state.rage > 60 ? -0.06 : state.rage > 40 ? -0.02 : state.rage < 20 ? 0.03 : 0;
  const credPressure = state.cred < 20 ? -0.10 : state.cred < 40 ? -0.04 : state.cred > 80 ? 0.08 : state.cred > 60 ? 0.04 : 0;
  const techPressure = state.techHype < 20 ? -0.06 : state.techHype > 70 ? 0.10 : state.techHype > 50 ? 0.05 : 0;

  // Combined sentiment (-28% to +21% range - more balanced!)
  const sentiment = ragePressure + credPressure + techPressure;

  // Base volatility by season (slightly reduced)
  const baseVol = state.seasonId === "meme_summer" ? 0.20
    : state.seasonId === "regulator_season" ? 0.10
      : state.seasonId === "builder_winter" ? 0.12
        : 0.15;

  // Extra volatility when things are bad (reduced from 0.15)
  const panicVol = state.rage > 80 || state.cred < 20 ? 0.10 : 0;
  const vol = baseVol + panicVol;

  // Random noise
  const noise = (rng() - 0.5) * vol;

  // Calculate target price
  const priceDelta = sentiment + noise;
  const targetPrice = state.tokenPrice * (1 + priceDelta);

  // PRICE MOMENTUM: Smooth towards target (50% move per turn)
  // This prevents wild whiplash from single turns
  let tokenPrice = state.tokenPrice + (targetPrice - state.tokenPrice) * 0.5;
  tokenPrice = Math.max(0.001, tokenPrice);

  // Realized delta for treasury calc
  const realizedDelta = (tokenPrice - state.tokenPrice) / state.tokenPrice;

  // TVL affected by price and sentiment
  const tvlSentiment = (100 - state.rage + state.cred + state.techHype) / 300;
  const tvlNoise = (rng() - 0.5) * 0.12;
  // TVL moves with price but also has its own momentum
  let tvl = state.tvl * (1 + realizedDelta * 0.6 + tvlNoise * tvlSentiment);
  tvl = Math.max(10_000_000, tvl); // Floor at 10M

  // Treasury exposure to native token - uses stablecoinRatio from hidden state
  // Diversification actions can improve this ratio over time
  const stableRatio = state.hidden.stablecoinRatio ?? 0.3;
  const nativeRatio = 1 - stableRatio;
  const nativePortion = state.officialTreasury * nativeRatio;
  const stablePortion = state.officialTreasury * stableRatio;
  const adjustedNative = nativePortion * (1 + realizedDelta);
  const officialTreasury = Math.max(0, stablePortion + adjustedNative);

  return { ...state, tokenPrice, tvl, officialTreasury };
}

function applyDrift(state: GameState, rng: RNG): GameState {
  const season = getSeason(state.seasonId);

  // PERCENTAGE-BASED DRIFT: Gentler at low values, stronger at high values
  // This prevents meters from collapsing too fast when already low
  // Season deltas are converted to percentage modifiers

  // Rage: 5% decay base, seasons can modify
  const rageDecayRate = 0.05 - (season.rageDecayDelta ?? 0) * 0.01; // +1 delta = 4% decay
  const rage = state.rage * (1 - rageDecayRate);

  // Heat: 5% decay base
  const heatDecayRate = 0.05 - (season.heatDriftDelta ?? 0) * 0.015; // regulator season: +3 delta = 0.5% decay (almost stable)
  const heat = state.heat * (1 - heatDecayRate);

  // Tech: 4% decay base (tech is sticky - people remember your tech)
  const techDecayRate = 0.04 - (season.techHypeDecayDelta ?? 0) * 0.01;
  const techHype = state.techHype * (1 - techDecayRate);

  // Cred: 2% decay base (credibility is the most sticky - hard to lose, hard to gain)
  const credDecayRate = 0.02 + (season.credDecayDelta ?? 0) * 0.01;
  const cred = state.cred * (1 - credDecayRate);

  let next: GameState = {
    ...state,
    rage: Math.max(0, Math.round(rage * 10) / 10), // Round to 1 decimal
    heat: Math.max(0, Math.round(heat * 10) / 10),
    techHype: Math.max(0, Math.round(techHype * 10) / 10),
    cred: Math.max(0, Math.round(cred * 10) / 10),
  };
  next = applyMarketDrift(next, rng);
  return next;
}

function checkGameOver(state: GameState): GameState {
  if (state.gameOver) return state;
  if (state.rage >= 100) {
    return { ...state, gameOver: true, gameOverReason: "Crew mutiny: they've taken control." };
  }
  if (state.heat >= 100) {
    return { ...state, gameOver: true, gameOverReason: "Earth recall: mission terminated." };
  }
  if (state.cred <= 0) {
    return { ...state, gameOver: true, gameOverReason: "Trust collapse: nobody follows orders." };
  }
  if (state.officialTreasury <= 0) {
    return { ...state, gameOver: true, gameOverReason: "Colony reserves depleted: mission unsustainable." };
  }
  if (state.turn >= state.maxTurns) {
    return {
      ...state,
      gameOver: true,
      gameOverReason: `Mission complete: your command ends after ${state.maxTurns} cycles.`,
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
    usedActionIds: [],
    crisisCount: 0,
    hidden: {
      auditRisk: 0,
      founderStability: 1,
      communityMemory: 0,
      stablecoinRatio: 0.3,
    },
    log: ["Welcome to Mars. Your mission begins now."],
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

    // Track this action ID for combo detection
    next = {
      ...next,
      usedActionIds: [...next.usedActionIds, actionId],
    };

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
        crisisCount: next.crisisCount + 1, // Track crisis count
        log: [`Crisis triggered: ${crisis.name}`, ...next.log],
      };
    }
  }

  // DEFENSIVE ACTION IMMUNITY: Defensive actions reduce random event chance
  const isDefensive = action?.defensive ?? false;
  const eventRoll = rng();
  const eventThreshold = isDefensive ? 0.3 : 1.0; // 70% reduction for defensive plays

  if (eventRoll < eventThreshold) {
    const ev = pickRandomEvent(next, rng, season);
    if (ev) {
      next = ev.apply(next);
    }
  }

  // sample next turn's actions
  const nextActions = sampleActionsForTurn(next, rng).map((a) => a.id);
  next = { ...next, availableActions: nextActions };

  next = checkGameOver(next);
  return next;
}

