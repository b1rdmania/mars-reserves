import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { GameState } from "../engine/state";
import { formatMoney } from "./format";
import { THEME } from "../theme";
import { SYMBOLS } from "./symbols";
import { useGameSession } from "../hooks/useGameSession";
import { CommanderPanel } from "./CommanderPanel";
import { MusicPlayer } from "./MusicPlayer";

interface Props {
  state: GameState;
  maxTurns: number;
  showDescription?: boolean;
}

// Meter type mapping for CSS classes and symbols
const METER_TYPE_MAP: Record<string, { cssType: string; symbol: string; label: string }> = {
  rage: { cssType: "unrest", symbol: SYMBOLS.CREW, label: "Crew Unrest" },
  heat: { cssType: "oversight", symbol: SYMBOLS.OVERSIGHT, label: "Earth Oversight" },
  cred: { cssType: "trust", symbol: SYMBOLS.CREW, label: "Crew Trust" },
  tech: { cssType: "momentum", symbol: SYMBOLS.RESEARCH, label: "Research" },
};

const MeterBar: React.FC<{
  label: string;
  value: number;
  max?: number;
  type: "rage" | "heat" | "cred" | "tech";
}> = ({ label, value, max = 100, type }) => {
  const pct = Math.min(100, (value / max) * 100);
  const displayValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

  // Danger zone detection
  const isDanger = (type === "rage" && value >= 60) || (type === "heat" && value >= 50);
  const isCritical = (type === "rage" || type === "heat") && value >= 80;
  const isLow = type === "cred" && value <= 30;
  const isVeryLow = type === "cred" && value <= 20;

  // Minimal danger effects - only pulse on critical
  const dangerClass = isCritical || isVeryLow ? "animate-pulse" : isLow ? "animate-flicker" : "";

  const labelColor = isCritical || isVeryLow
    ? "text-red-400"
    : isDanger
      ? "text-amber-500"
      : isLow
        ? "text-amber-400"
        : "text-[#4a5565]";

  const meterConfig = METER_TYPE_MAP[type];
  const meterCssType = meterConfig?.cssType || type;
  const meterSymbol = meterConfig?.symbol || "";

  return (
    <div className={`flex-1 min-w-[100px] ${dangerClass}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[9px] uppercase tracking-[0.06em] ${labelColor} flex items-center gap-1`}>
          <span className="text-xs">{meterSymbol}</span>
          {label}
        </span>
        <span className={`text-[10px] font-semibold tabular-nums font-mono ${isCritical || isVeryLow ? "text-red-400" : isDanger || isLow ? "text-amber-500" : "text-[#5a6475]"}`}>
          {displayValue}
        </span>
      </div>
      <div className={`meter-bar meter-${meterCssType} ${isCritical ? "critical" : isDanger || isLow ? "warning" : ""}`}>
        <div
          className="meter-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const TopPanel: React.FC<Props> = ({ state, maxTurns, showDescription = true }) => {
  const { colonyReserves, legacy, rage, oversightPressure, cred, techHype } = state;
  const { authenticated } = usePrivy();
  const { profile } = useGameSession();

  // Use profile commander name if authenticated, otherwise show guest indicator
  const isCommander = authenticated && profile?.commander_name;
  const displayName = isCommander
    ? `CDR. ${profile.commander_name}`
    : 'LT. UNREGISTERED';

  return (
    <div className="space-y-3 mb-4">
      {/* Header - terminal style */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-wide uppercase">{THEME.gameName}</h1>
            <span className="text-[8px] uppercase tracking-[0.12em] border border-[#2d3544] text-[#5a6475] px-2 py-0.5">BETA</span>
          </div>
          {/* Commander Name */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-mono uppercase tracking-[0.1em] ${isCommander ? 'text-[#0891b2]' : 'text-[#5a6475]'}`}>
              {displayName}
            </span>
            {authenticated && (
              <div className="h-1 w-1 bg-[#16a34a]" title="Online" />
            )}
          </div>
          {showDescription && (
            <p className="text-[10px] text-[#5a6475] leading-snug mt-1 max-w-md">
              Survive {maxTurns} cycles. Maintain operational margin.
            </p>
          )}
        </div>
        <div className="text-right shrink-0 flex items-start gap-3">
          {/* Music Player */}
          <MusicPlayer />
          {/* Commander Panel for authenticated users */}
          {authenticated && <CommanderPanel />}
          {/* Turn Counter */}
          <div>
            {(() => {
              const turnsLeft = maxTurns - state.turn;
              const urgencyColor = turnsLeft <= 2 ? "text-red-400" : turnsLeft <= 3 ? "text-amber-400" : "text-white";
              const pulseClass = turnsLeft <= 3 ? "animate-pulse" : "";
              return (
                <div className={`text-2xl font-bold tabular-nums ${urgencyColor} ${pulseClass}`}>
                  {state.turn}<span className="text-slate-500">/{maxTurns}</span>
                </div>
              );
            })()}
            <div className="text-[10px] uppercase text-slate-500">{THEME.ui.turn}</div>
          </div>
        </div>
      </div>

      {/* Legacy Score - institutional, rare green */}
      <div className="terminal-frame border-l-2 border-l-[#16a34a] flex items-center gap-3 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-[#4a5565] mb-0.5">{THEME.ui.score}</div>
          <div className="text-[#16a34a] text-xl font-semibold tabular-nums">{formatMoney(legacy)}</div>
        </div>
      </div>

      {/* Operational Margin */}
      {(() => {
        const pct = (colonyReserves / 1_000_000_000) * 100;

        // Determine margin state
        let marginState: string;
        let marginColor: string;

        if (pct > 85) {
          marginState = "HIGH";
          marginColor = "text-amber-400";
        } else if (pct > 70) {
          marginState = "STABLE";
          marginColor = "text-amber-400";
        } else if (pct > 55) {
          marginState = "THINNING";
          marginColor = "text-amber-500";
        } else if (pct > 40) {
          marginState = "STRAINED";
          marginColor = "text-orange-500";
        } else if (pct > 20) {
          marginState = "CRITICAL";
          marginColor = "text-red-500";
        } else {
          marginState = "UNSAFE";
          marginColor = "text-red-400";
        }

        // Format quantity without currency
        const formatUnits = (v: number) => {
          if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B units`;
          if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M units`;
          return `${Math.round(v)} units`;
        };

        // Segmented display: 10 blocks
        const totalSegments = 10;
        const filledSegments = Math.round(pct / 10);

        return (
          <div className="terminal-frame py-4">
            {/* Header - hero element */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{SYMBOLS.TIME}</span>
              <div className="text-[11px] uppercase tracking-[0.12em] text-[#5a6475]">
                Operational Margin
              </div>
            </div>

            {/* Segmented blocks - larger, more prominent */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: totalSegments }).map((_, i) => {
                let segmentClass = "h-6 flex-1 border border-[#1a1f28]";
                if (i < filledSegments) {
                  if (pct <= 20) segmentClass += " bg-[#dc2626] border-[#dc2626]";
                  else if (pct <= 40) segmentClass += " bg-[#ea580c] border-[#ea580c]";
                  else segmentClass += " bg-[#d97706] border-[#d97706]";
                }
                return <div key={i} className={segmentClass} />;
              })}
            </div>

            {/* Status readout - larger, dominant */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.1em] text-[#4a5565]">
                Status:
              </span>
              <span className={`text-lg font-bold tracking-wide ${marginColor}`}>
                {marginState}
              </span>
            </div>

            {/* Units - very muted */}
            <div className="text-[8px] text-[#3a4555] text-right font-mono mt-1">
              {formatUnits(colonyReserves)}
            </div>
          </div>
        );
      })()}

      {/* Meter Bars */}
      <div className="game-card">
        <div className="flex flex-wrap gap-4">
          <MeterBar label="Unrest" value={rage} type="rage" />
          <MeterBar label="Oversight" value={oversightPressure} type="heat" />
          <MeterBar label="Trust" value={cred} type="cred" />
          <MeterBar label="Momentum" value={techHype} type="tech" />
        </div>
      </div>
    </div>
  );
};
