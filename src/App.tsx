import React, { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
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
import { playSound, initAudio } from "./engine/audio";
import { ACTIONS, sampleActionsForTurn } from "./engine/actions";
import { LogSection } from "./ui/LogSection";
import { HowToPlayModal } from "./ui/HowToPlayModal";
import { LeaderboardModal } from "./ui/LeaderboardModal";
import { ArchivePanel } from "./ui/ArchivePanel";
import { SplashScreen } from "./ui/SplashScreen";
import { GuestBanner } from "./ui/GuestBanner";
import { CommanderNameModal } from "./ui/CommanderNameModal";
import { useGameSession } from "./hooks/useGameSession";
import { useMusic } from "./hooks/useMusic";
import { Footer } from "./ui/Footer";
import { GlobalLeaderboard } from "./ui/GlobalLeaderboard";

const App: React.FC = () => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const rng = useMemo(() => mulberry32(seed), [seed]);

  // Session and auth state
  const { login, authenticated, ready } = usePrivy();
  const { isGuest, guestCallSign, profile, needsCommanderName, refreshProfile } = useGameSession();

  const seasonId: SeasonId = "dust_season"; // V1: fixed season
  const [state, setState] = useState<GameState | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [turnModalOpen, setTurnModalOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGlobalArchive, setShowGlobalArchive] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showCommanderNameModal, setShowCommanderNameModal] = useState(false);
  const [turnModalData, setTurnModalData] = useState<{
    actionName: string;
    severity: SeverityResult | null;
    deltas: { label: string; delta: number; unit?: string }[];
    logLine?: string;
  } | null>(null);

  const started = !!state;
  const maxTurnsDisplay = state?.maxTurns ?? 10;

  // Get music controls (must be at top with other hooks)
  const { startMusic, stopMusic } = useMusic();

  // Determine display name based on auth state
  const displayName = authenticated && profile?.commander_name
    ? profile.commander_name
    : guestCallSign;

  // Show commander name modal when needed
  useEffect(() => {
    if (ready && authenticated && needsCommanderName && !showCommanderNameModal) {
      setShowCommanderNameModal(true);
    }
  }, [ready, authenticated, needsCommanderName, showCommanderNameModal]);

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



  const handleAction = (id: ActionId) => {
    playSound("click");
    setState((s) => {
      if (!s) return s;
      const before = { ...s };
      const after = step(s, id, rng);
      const deltas = [
        { label: "Official Treasury", delta: after.colonyReserves - before.colonyReserves },
        { label: "Legacy", delta: after.legacy - before.legacy },
        { label: "Unrest", delta: after.rage - before.rage },
        { label: "Oversight", delta: after.oversightPressure - before.oversightPressure },
        { label: "Trust", delta: after.cred - before.cred },
        { label: "Research", delta: after.techHype - before.techHype },
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

      // The action's log entry was added by action.apply(), but events may have prepended more entries
      // Log structure after step(): [event_logs..., severity_line, action_log, old_logs...]
      // Since events prepend their logs, action log position shifts based on how many events fired
      // Best approach: find the first log entry that matches action patterns (not event patterns)
      const newLogCount = after.log.length - before.log.length;
      const newLogs = after.log.slice(0, newLogCount);

      // Event logs typically start with emojis or specific phrases
      const eventPrefixes = [
        "Earth analyst", "📋", "🌪️", "☀️", "🚀 Supply", "🔧 Critical habitat",
        "🔧 Systems integrity", "💧", "🔬 Major research", "📰", "🎉 Crew celebrates",
        "💬 Someone leaked", "🧵 Anonymous", "📊 External crisis", "📉 CONTRACTOR",
        "🚨 CRITICAL SYSTEMS", "You argued with a junior"
      ];

      const isEventLog = (log: string) => eventPrefixes.some(prefix => log.startsWith(prefix));
      const isSeverityLog = (log: string) =>
        log.startsWith("Glancing") || log.startsWith("Normal") || log.startsWith("Critical");

      // Find the action's log (not event, not severity)
      let narrativeLog = newLogs.find(log => !isEventLog(log) && !isSeverityLog(log)) ?? "";

      // If still empty or still looks wrong, use description
      if (!narrativeLog) {
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
        stopMusic(); // Stop game music on game over
      }

      return after;
    });
  };

  const handleStart = () => {
    playSound("click");
    startMusic(); // Start game music when actually playing
    const base = initialState({
      chainName: "Olympus Base",
      founderName: displayName || "Commander",
      ticker: "OLY",
      seasonId,
    });
    const sampled = sampleActionsForTurn(base, rng).map((a) => a.id);
    setState({ ...base, availableActions: sampled });
  };

  const handleSignInAndStart = async () => {
    playSound("click");

    // If already authenticated, start the game directly
    if (authenticated) {
      handleStart(); // Use same logic as starting game
      return;
    }

    try {
      await login();
      // Game will start after user sets commander name
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleRestart = () => {
    playSound("click");
    // Close any open modals and clear their data
    setTurnModalOpen(false);
    setTurnModalData(null);
    // Refresh profile to get updated stats
    refreshProfile();
    // Create fresh game with new seed
    const newSeed = Math.floor(Math.random() * 1e9);
    setSeed(newSeed);
    const newRng = mulberry32(newSeed);
    const base = initialState({
      chainName: "Olympus Base",
      founderName: displayName || "Commander",
      ticker: "OLY",
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
        { label: "Official Treasury", delta: after.colonyReserves - before.colonyReserves },
        { label: "Legacy", delta: after.legacy - before.legacy },
        { label: "Unrest", delta: after.rage - before.rage },
        { label: "Oversight", delta: after.oversightPressure - before.oversightPressure },
        { label: "Trust", delta: after.cred - before.cred },
        { label: "Research", delta: after.techHype - before.techHype },
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


  const handleBackToHome = () => {
    playSound("click");
    stopMusic();
    setState(null);
    setShowSplash(false);
  };

  // Splash screen
  if (showSplash) {
    return <SplashScreen onStart={() => {
      // Don't start game music here - it starts when actually playing
      setShowSplash(false);
    }} />;
  }

  // Config screen
  if (!started) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4">
        <div className="max-w-md w-full terminal-frame space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-lg font-semibold uppercase tracking-wide">Mars Extraction</h1>
            <p className="text-[11px] text-[#5a6475] mt-1">A public mission. A private legacy.</p>
          </div>

          {/* System Status Lines */}
          <div className="border border-[#1a1f28] bg-[#0a0c10] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-[#4a5565]">Status</span>
              <span className="text-[10px] text-[#d97706] font-medium uppercase tracking-wide">Awaiting Command</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-[#4a5565]">Earth Link</span>
              <span className="text-[10px] text-[#16a34a] font-medium uppercase tracking-wide">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-[#4a5565]">Mission Duration</span>
              <span className="text-[10px] text-[#8b95a5] font-mono">{maxTurnsDisplay} Cycles</span>
            </div>
          </div>

          {/* Colony Archive */}
          <ArchivePanel />

          {/* Navigation & Info */}
          <div className="space-y-2 mb-4">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="w-full py-2 px-4 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500/70 hover:text-emerald-500 font-medium border border-emerald-500/20 hover:border-emerald-500/40 text-xs transition-colors"
            >
              ? How To Play?
            </button>
            <button
              onClick={() => setShowGlobalArchive(true)}
              className="w-full py-1.5 px-4 bg-[#0d0f13] hover:bg-[#12151c] text-[#4a5565] hover:text-[#0891b2] font-medium border border-[#1a1f28] text-[9px] uppercase tracking-[0.2em] transition-all"
            >
              [ Open Global Archive ]
            </button>
          </div>

          {/* Dual CTA: Guest vs Sign In */}
          <div className="space-y-3">
            {/* Play as Guest - Primary */}
            <div className="border border-[#1a1f28] bg-[#0a0c10] p-3">
              <button
                onClick={handleStart}
                className="w-full py-3 px-4 bg-[#0891b2] hover:bg-[#0e7490] text-white font-medium uppercase tracking-wider text-sm"
              >
                Play as Guest
              </button>
            </div>

            {/* Sign In with Privy - Secondary */}
            <div className="border border-[#1a1f28] bg-[#0a0c10] p-3">
              <button
                onClick={handleSignInAndStart}
                disabled={!ready}
                className="w-full py-3 px-4 bg-[#0d0f13] hover:bg-[#12151c] text-[#c8cdd5] font-medium uppercase tracking-wider text-sm border border-[#1a1f28] disabled:opacity-50"
              >
                {authenticated ? 'Continue as Commander' : 'Sign In with Privy'}
              </button>
              <div className="mt-2 flex items-center justify-center gap-3 text-[9px] text-[#4a5565]">
                <span>• Secure Privy Login</span>
                <span>• Persistent Career</span>
              </div>
            </div>
          </div>

          {/* Warning Footer */}
          <div className="text-[9px] text-[#4a5565] text-center uppercase tracking-wide flex items-center justify-center gap-1.5">
            <span className="text-[#d97706]">⚠</span>
            <span>All actions recorded on Movement</span>
          </div>

          <HowToPlayModal open={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
          <LeaderboardModal open={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
          <CommanderNameModal
            open={showCommanderNameModal}
            onClose={() => {
              setShowCommanderNameModal(false);
              // Start game after setting commander name
              if (profile?.commander_name) {
                handleStart();
              }
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // Global Archive View
  if (showGlobalArchive) {
    return <GlobalLeaderboard onBack={() => setShowGlobalArchive(false)} />;
  }

  // Main game
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 pb-8">
        {/* Guest Banner */}
        {isGuest && <GuestBanner className="mb-4" />}

        <TopPanel state={state} maxTurns={state.maxTurns} showDescription={false} onTitleClick={handleBackToHome} />

        <LogSection log={state?.log ?? []} />

        {/* Actions */}
        <div className={`${state?.pendingCrisis ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Actions</span>
          </div>
          {state && <ActionPanel state={state} onSelect={handleAction} disabled={!!state.pendingCrisis} />}
        </div>

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
            onBackToHome={handleBackToHome}
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
            <div>Reserves: {state.colonyReserves.toFixed(0)}</div>
            <div>Legacy: {state.legacy.toFixed(0)}</div>
            <div>Scrutiny: {state.hidden.scrutiny.toFixed(2)}</div>
            <div>Founder stability: {state.hidden.founderStability.toFixed(2)}</div>
            <div>Community memory: {state.hidden.communityMemory.toFixed(2)}</div>
            <div>Recent events: {state.recentEvents.join(", ") || "None"}</div>
          </div>
        )}

        {/* Leaderboard Modal */}
        <LeaderboardModal open={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      </div>
      <Footer className="max-w-2xl mx-auto w-full px-4" />
    </div>
  );
};

export default App;
