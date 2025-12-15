import React, { useEffect, useMemo, useState } from "react";
import { initialState, step } from "./engine/engine";
import { mulberry32 } from "./engine/rng";
import type { ActionId } from "./engine/actions";
import { ActionPanel } from "./ui/ActionPanel";
import { EndOfRunCard } from "./ui/EndOfRunCard";
import { CrisisModal } from "./ui/CrisisModal";
import { resolveCrisisOption } from "./engine/crises";
import type { GameState } from "./engine/state";
import type { SeasonId } from "./engine/seasons";
import { TopPanel } from "./ui/TopPanel";
import { TurnResultModal } from "./ui/TurnResultModal";
import type { SeverityResult } from "./engine/severity";
import { playSound, setMuted, initAudio } from "./engine/audio";
import { ACTIONS, sampleActionsForTurn } from "./engine/actions";
import { LogSection } from "./ui/LogSection";
import { HowToPlayModal } from "./ui/HowToPlayModal";
import { LeaderboardModal } from "./ui/LeaderboardModal";

const App: React.FC = () => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const rng = useMemo(() => mulberry32(seed), [seed]);

  const [chainName, setChainName] = useState("ZooChain");
  const [ticker, setTicker] = useState("ZOO");
  const [founderName, setFounderName] = useState("You");
  const seasonId: SeasonId = "meme_summer"; // V1: fixed season
  const [state, setState] = useState<GameState | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [turnModalOpen, setTurnModalOpen] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [turnModalData, setTurnModalData] = useState<{
    actionName: string;
    severity: SeverityResult | null;
    deltas: { label: string; delta: number; unit?: string }[];
    logLine?: string;
  } | null>(null);

  const started = !!state;
  const maxTurnsDisplay = state?.maxTurns ?? 20;

  // Debug toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "~") setShowDebug((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Initialize audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const toggleMute = () => {
    const newMuted = !muted;
    setMutedState(newMuted);
    setMuted(newMuted);
  };

  const handleAction = (id: ActionId) => {
    playSound("click");
    setState((s) => {
      if (!s) return s;
      const before = { ...s };
      const after = step(s, id, rng);
      const deltas = [
        { label: "Official Treasury", delta: after.officialTreasury - before.officialTreasury },
        { label: "Siphoned", delta: after.siphoned - before.siphoned },
        { label: "Rage", delta: after.rage - before.rage },
        { label: "Heat", delta: after.heat - before.heat },
        { label: "Cred", delta: after.cred - before.cred },
        { label: "Tech", delta: after.techHype - before.techHype },
        { label: "Price", delta: after.tokenPrice - before.tokenPrice },
        { label: "TVL", delta: after.tvl - before.tvl },
      ].filter((d) => d.delta !== 0);

      // extract severity from newest log line if present
      const severityLine = after.log[0]?.startsWith("Glancing") || after.log[0]?.startsWith("Normal") || after.log[0]?.startsWith("Critical")
        ? after.log[0]
        : null;
      let severity: SeverityResult | null = null;
      if (severityLine) {
        const match = severityLine.match(/(Glancing|Normal|Critical) → (.+)/);
        if (match) {
          severity = {
            label: match[1] as SeverityResult["label"],
            roll: match[1] === "Critical" ? 6 : match[1] === "Glancing" ? 1 : 3,
            multiplier: 1,
          };
        }
      }

      const actionDef = ACTIONS.find((a) => a.id === id);
      const actionName = actionDef?.name ?? id.replace(/_/g, " ");

      // Find the actual narrative log (not the severity line)
      // The narrative should be the log entry added by the action's apply function
      let narrativeLog = severityLine ? after.log[1] : after.log[0];

      // If we still got a severity-style line or nothing, use action description
      if (!narrativeLog || narrativeLog.startsWith("Glancing") || narrativeLog.startsWith("Normal") || narrativeLog.startsWith("Critical")) {
        narrativeLog = actionDef?.description ?? "";
      }

      setTurnModalData({
        actionName,
        severity,
        deltas,
        logLine: narrativeLog,
      });
      setTurnModalOpen(true);

      // Play sound based on outcome
      const hasNegative = deltas.some((d) => {
        const badWhenUp = d.label.toLowerCase().includes("rage") || d.label.toLowerCase().includes("heat");
        return badWhenUp ? d.delta > 0 : d.delta < 0;
      });
      playSound(hasNegative ? "negative" : "positive");

      // Check for crisis
      if (after.pendingCrisis && !before.pendingCrisis) {
        playSound("crisis");
      }

      // Check for game over
      if (after.gameOver && !before.gameOver) {
        setTimeout(() => playSound("gameover"), 100);
      }

      return after;
    });
  };

  const handleStart = () => {
    playSound("click");
    const base = initialState({
      chainName: chainName || "ZooChain",
      founderName: founderName || "You",
      ticker: ticker || "ZOO",
      seasonId,
    });
    const sampled = sampleActionsForTurn(base, rng).map((a) => a.id);
    setState({ ...base, availableActions: sampled });
  };

  const handleRestart = () => {
    playSound("click");
    // Close any open modals and clear their data
    setTurnModalOpen(false);
    setTurnModalData(null);
    // Create fresh game with new seed
    const newSeed = Math.floor(Math.random() * 1e9);
    setSeed(newSeed);
    const newRng = mulberry32(newSeed);
    const base = initialState({
      chainName: chainName || "ZooChain",
      founderName: founderName || "You",
      ticker: ticker || "ZOO",
      seasonId,
    });
    const sampled = sampleActionsForTurn(base, newRng).map((a) => a.id);
    setState({ ...base, availableActions: sampled });
  };

  const handleResolveCrisis = (optionId: string) => {
    playSound("click");
    setState((s) => {
      if (!s) return s;
      const before = { ...s };
      const result = resolveCrisisOption(s, optionId, rng);
      if (!result) return s;
      const after = result.state;
      const deltas = [
        { label: "Official Treasury", delta: after.officialTreasury - before.officialTreasury },
        { label: "Siphoned", delta: after.siphoned - before.siphoned },
        { label: "Community Rage", delta: after.rage - before.rage },
        { label: "Regulatory Heat", delta: after.heat - before.heat },
        { label: "Cred", delta: after.cred - before.cred },
        { label: "Tech", delta: after.techHype - before.techHype },
        { label: "Price", delta: after.tokenPrice - before.tokenPrice },
        { label: "TVL", delta: after.tvl - before.tvl },
      ].filter((d) => d.delta !== 0);
      setTurnModalData({
        actionName: s.pendingCrisis?.name ?? "Crisis",
        severity: null,
        deltas,
        logLine: result.narrative,
      });
      setTurnModalOpen(true);
      return after;
    });
  };

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4">
        <div className="max-w-md w-full game-card-elevated space-y-5 animate-scaleIn">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">Move: Mars Reserves</h1>
              <span className="text-[10px] uppercase tracking-wide bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Beta</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Over {maxTurnsDisplay} cycles, build your legacy on humanity&apos;s first Mars colony
              — without triggering mutiny, Earth recall, or mission failure.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-slate-500">Colony Name</span>
              <input
                className="w-full mt-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={chainName}
                onChange={(e) => setChainName(e.target.value)}
                placeholder="Olympus Base"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-slate-500">Mission Code</span>
              <input
                className="w-full mt-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm uppercase focus:outline-none focus:border-sky-500 transition-colors"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="OLY"
                maxLength={4}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-slate-500">Commander Name</span>
              <input
                className="w-full mt-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="Cmdr. Chen"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="flex-1 py-4 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors text-base"
            >
              ❓ Briefing
            </button>
            <button
              onClick={handleStart}
              className="flex-[2] py-4 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors text-base"
            >
              Begin Mission →
            </button>
          </div>

          <HowToPlayModal open={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
        </div>
      </div>
    );
  }

  // Main game
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 pb-8">
        <TopPanel state={state} maxTurns={state.maxTurns} showDescription={false} />

        {/* Mute and Leaderboard buttons */}
        <div className="flex items-center justify-between mb-3">
          <button
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1"
            onClick={() => setShowLeaderboard(true)}
          >
            🏆 Leaderboard
          </button>
          <button
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1"
            onClick={toggleMute}
          >
            {muted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
        </div>

        {/* Actions */}
        <div className={`${state?.pendingCrisis ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Actions</span>
          </div>
          {state && <ActionPanel state={state} onSelect={handleAction} disabled={!!state.pendingCrisis} />}
        </div>

        <LogSection log={state?.log ?? []} />

        {/* Modals */}
        {state && <CrisisModal crisis={state.pendingCrisis ?? null} onResolve={handleResolveCrisis} />}

        <TurnResultModal
          open={turnModalOpen}
          onClose={() => setTurnModalOpen(false)}
          actionName={turnModalData?.actionName ?? ""}
          severity={turnModalData?.severity ?? null}
          deltas={turnModalData?.deltas ?? []}
          logLine={turnModalData?.logLine}
        />

        {state && (
          <EndOfRunCard
            state={state}
            onRestart={handleRestart}
            onChangeNames={() => setState(null)}
            seed={seed}
            actionIds={state.usedActionIds}
          />
        )}

        {/* Debug Panel */}
        {showDebug && state && (
          <div className="fixed bottom-4 left-4 game-card text-[11px] space-y-1 z-10 max-w-xs">
            <div className="font-semibold text-slate-200">Debug (~)</div>
            <div>Seed: {seed}</div>
            <div>Ticker: {state.ticker}</div>
            <div>Price: ${state.tokenPrice.toFixed(2)}</div>
            <div>TVL: {state.tvl.toFixed(0)}</div>
            <div>Official treasury: {state.officialTreasury.toFixed(0)}</div>
            <div>Siphoned: {state.siphoned.toFixed(0)}</div>
            <div>Audit risk: {state.hidden.auditRisk.toFixed(2)}</div>
            <div>Founder stability: {state.hidden.founderStability.toFixed(2)}</div>
            <div>Community memory: {state.hidden.communityMemory.toFixed(2)}</div>
            <div>Recent events: {state.recentEvents.join(", ") || "None"}</div>
          </div>
        )}

        {/* Leaderboard Modal */}
        <LeaderboardModal open={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      </div>
    </div>
  );
};

export default App;
