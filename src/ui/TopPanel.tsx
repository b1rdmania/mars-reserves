import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { GameState } from "../engine/state";
import { formatMoney } from "./format";
import { THEME } from "../theme";

interface Props {
  state: GameState;
  maxTurns: number;
  showDescription?: boolean;
  muted?: boolean;
  onToggleMute?: () => void;
}

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

  // Visual danger effects
  const dangerClass = isCritical || isVeryLow
    ? "animate-pulse"
    : isDanger
      ? "opacity-90"
      : isLow
        ? "animate-flicker"
        : "";

  const labelColor = isCritical || isVeryLow
    ? "text-red-400"
    : isDanger
      ? "text-amber-400"
      : isLow
        ? "text-amber-300"
        : "text-slate-400";

  return (
    <div className={`flex-1 min-w-[120px] ${dangerClass}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[11px] uppercase tracking-wide ${labelColor}`}>{label}</span>
        <span className={`text-sm font-bold ${isCritical || isVeryLow ? "text-red-400" : isDanger || isLow ? "text-amber-400" : "text-slate-200"}`}>
          {displayValue}
        </span>
      </div>
      <div className={`meter-bar meter-${type} ${isCritical ? "critical" : isDanger || isLow ? "warning" : ""}`}>
        <div
          className="meter-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const TopPanel: React.FC<Props> = ({ state, maxTurns, showDescription = true, muted, onToggleMute }) => {
  const { colonyReserves, legacy, rage, oversightPressure, cred, techHype } = state;
  const { user, authenticated } = usePrivy();
  const [commanderName, setCommanderName] = useState<string | null>(null);

  // Fetch verified commander name from profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/profiles?privy_user_id=eq.${encodeURIComponent(user.id)}&select=commander_name`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setCommanderName(data[0].commander_name);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile name:", err);
      }
    }

    if (authenticated) {
      fetchProfile();
    } else {
      setCommanderName(null);
    }
  }, [authenticated, user?.id]);

  return (
    <div className="space-y-4 mb-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">{THEME.gameName}</h1>
            <span className="text-[10px] uppercase tracking-wide bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">V1 Beta</span>
          </div>
          {/* Commander Name - always show */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-sky-400 font-mono uppercase tracking-wider">
              {authenticated && commanderName ? `CDR. ${commanderName}` : state.founderName}
            </span>
            {authenticated && (
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Online" />
            )}
          </div>
          {showDescription && (
            <p className="text-xs text-slate-400 leading-snug mt-1 max-w-md">
              Build humanity's legacy on Mars in {maxTurns} cycles without triggering mutiny or mission shutdown.
            </p>
          )}
        </div>
        <div className="text-right shrink-0 flex items-start gap-3">
          {/* Mute Button */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors p-1"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          )}
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

      {/* Legacy Score - Hero Stat */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-4">
        <span className="text-3xl">🏛️</span>
        <div>
          <div className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">{THEME.ui.score}</div>
          <div className="text-emerald-300 text-2xl font-bold tabular-nums">{formatMoney(legacy)}</div>
        </div>
      </div>

      {/* Operational Margin */}
      {(() => {
        const pct = (colonyReserves / 1_000_000_000) * 100;

        // Determine margin state
        let marginState: string;
        let marginColor: string;
        let bgColor: string;

        if (pct > 85) {
          marginState = "HIGH";
          marginColor = "text-amber-400";
          bgColor = "bg-amber-500/5 border-amber-500/20";
        } else if (pct > 70) {
          marginState = "STABLE";
          marginColor = "text-amber-400";
          bgColor = "bg-amber-500/5 border-amber-500/20";
        } else if (pct > 55) {
          marginState = "THINNING";
          marginColor = "text-amber-500";
          bgColor = "bg-amber-500/10 border-amber-500/30";
        } else if (pct > 40) {
          marginState = "STRAINED";
          marginColor = "text-orange-500";
          bgColor = "bg-orange-500/10 border-orange-500/30";
        } else if (pct > 20) {
          marginState = "CRITICAL";
          marginColor = "text-red-500";
          bgColor = "bg-red-500/10 border-red-500/30";
        } else {
          marginState = "UNSAFE";
          marginColor = "text-red-400";
          bgColor = "bg-red-500/15 border-red-500/40";
        }

        // Format quantity without currency
        const formatUnits = (v: number) => {
          if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B units`;
          if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M units`;
          return `${Math.round(v)} units`;
        };

        return (
          <div className={`rounded-xl p-4 border ${bgColor}`}>
            {/* Header - small, institutional */}
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
              Operational Margin
            </div>

            {/* Primary Readout - the star */}
            <div className="text-center mb-2">
              <span className="text-xs text-slate-500 mr-1">Margin:</span>
              <span className={`text-xl font-bold tracking-wide ${marginColor}`}>
                {marginState}
              </span>
            </div>

            {/* Context Line - worldbuilding */}
            <div className="text-[9px] text-slate-600 text-center mb-2">
              Life support · Power · Logistics
            </div>

            {/* Quantity - demoted, muted */}
            <div className="text-[10px] text-slate-500 text-center font-mono">
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
