import React, { useEffect, useMemo, useState } from "react";
import { initialState, step } from "./engine/engine";
import { mulberry32 } from "./engine/rng";
import type { ActionId } from "./engine/actions";
import { ActionPanel } from "./ui/ActionPanel";
import { EndOfRunCard } from "./ui/EndOfRunCard";
import { CrisisModal } from "./ui/CrisisModal";
import { resolveCrisisOption } from "./engine/crises";
import type { GameState } from "./engine/state";
import { SEASONS } from "./engine/seasons";
import type { SeasonId } from "./engine/seasons";
import { TopPanel } from "./ui/TopPanel";
import { TurnResultModal } from "./ui/TurnResultModal";
import type { SeverityResult } from "./engine/severity";
import { playSound, setMuted } from "./engine/audio";
import { ACTIONS, sampleActionsForTurn } from "./engine/actions";
import { LogSection } from "./ui/LogSection";

const App: React.FC = () => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const rng = useMemo(() => mulberry32(seed), [seed]);

  const [chainName, setChainName] = useState("ZooChain");
  const [ticker, setTicker] = useState("ZOO");
  const [founderName, setFounderName] = useState("You");
  const [seasonId, setSeasonId] = useState<SeasonId>("meme_summer");
  const [state, setState] = useState<GameState | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [turnModalOpen, setTurnModalOpen] = useState(false);
  const [turnModalData, setTurnModalData] = useState<{
    actionName: string;
    severity: SeverityResult | null;
    deltas: { label: string; delta: number; unit?: string }[];
    logLine?: string;
  } | null>(null);

  const started = !!state;
  const maxTurnsDisplay = state?.maxTurns ?? 20;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "~") setShowDebug((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
        const match = severityLine.match(/(Glancing|Normal|Critical) \((\d)\/6\) → (.+)/);
        if (match) {
          severity = {
            label: match[1] as SeverityResult["label"],
            roll: Number(match[2]),
            multiplier: 1,
          };
        }
      }

      const actionName =
        severityLine?.split("→ ")[1]?.trim() ??
        ACTIONS.find((a) => a.id === id)?.name ??
        id.replace(/_/g, " ");

      setTurnModalData({
        actionName,
        severity,
        deltas,
        logLine: after.log[1],
      });
      setTurnModalOpen(true);
      playSound(deltas.some((d) => d.delta < 0) ? "negative" : "positive");
      return after;
    });
  };

  const handleStart = () => {
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
    const newSeed = Math.floor(Math.random() * 1e9);
    setSeed(newSeed);
    const base = initialState({
      chainName: chainName || "ZooChain",
      founderName: founderName || "You",
      ticker: ticker || "ZOO",
      seasonId,
    });
    const sampled = sampleActionsForTurn(base, rng).map((a) => a.id);
    setState({ ...base, availableActions: sampled });
  };

  const handleResolveCrisis = (optionId: string) => {
    setState((s) => (s ? resolveCrisisOption(s, optionId, rng) : s));
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex items-center justify-center">
        <div className="max-w-md w-full p-6 space-y-4 bg-[#12151c] rounded-[10px] border border-[#1c1f27]">
          <h1 className="text-2xl font-bold font-mono">Treasury Wars v1.0</h1>
          <p className="text-sm text-slate-300 font-mono">
            Objective: Over {maxTurnsDisplay.toString()} turns, convert as much of the chain&apos;s official treasury
            into off-chain founder funds as possible — without triggering a DAO coup, regulatory enforcement, jail time,
            or a founder assassination arc.
          </p>
          <div className="space-y-3">
            <label className="text-sm space-y-1 block">
              <span className="text-slate-300 font-mono">Chain name</span>
              <input
                className="w-full rounded-[8px] bg-[#171b24] border border-[#1c1f27] px-3 py-2 text-sm font-mono"
                value={chainName}
                onChange={(e) => setChainName(e.target.value)}
                placeholder="FrogFi"
              />
            </label>
            <label className="text-sm space-y-1 block">
              <span className="text-slate-300 font-mono">Token ticker</span>
              <input
                className="w-full rounded-[8px] bg-[#171b24] border border-[#1c1f27] px-3 py-2 text-sm font-mono uppercase"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="ZOO"
                maxLength={4}
              />
            </label>
            <label className="text-sm space-y-1 block">
              <span className="text-slate-300 font-mono">Founder name</span>
              <input
                className="w-full rounded-[8px] bg-[#171b24] border border-[#1c1f27] px-3 py-2 text-sm font-mono"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="0xAndy"
              />
            </label>
            <label className="text-sm space-y-1 block">
              <span className="text-slate-300 font-mono">Season</span>
              <select
                className="w-full rounded-[8px] bg-[#171b24] border border-[#1c1f27] px-3 py-2 text-sm font-mono"
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value as SeasonId)}
              >
                {SEASONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            onClick={handleStart}
            className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 text-sm font-semibold py-2"
          >
            Start run
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex items-start justify-center">
      <div className="max-w-4xl w-full p-3 sm:p-5 relative bg-[#0d0f14] pb-8 space-y-3">
        <TopPanel state={state} maxTurns={state.maxTurns} showDescription={false} />

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Press ~ to toggle debug panel</span>
          <button
            className="underline"
            onClick={() => setMuted(true)}
            title="Mute SFX"
          >
            Mute
          </button>
        </div>

        <div className={`${state?.pendingCrisis ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="text-sm font-semibold mb-1 font-mono">Actions</h2>
          {state && <ActionPanel state={state} onSelect={handleAction} disabled={!!state.pendingCrisis} />}
        </div>

        <LogSection log={state?.log ?? []} />

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
          />
        )}

        {showDebug && state && (
          <div className="fixed bottom-4 left-4 bg-[#12151c]/95 border border-[#1c1f27] rounded-[8px] p-3 text-[11px] space-y-1 z-10 font-mono">
            <div className="font-semibold text-slate-200">Debug</div>
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
      </div>
    </div>
  );
};

export default App;
