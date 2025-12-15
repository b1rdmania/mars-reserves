import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";
import { THEME } from "../theme";

interface Props {
  state: GameState;
  maxTurns: number;
  showDescription?: boolean;
}

const MeterBar: React.FC<{
  label: string;
  value: number;
  max?: number;
  type: "rage" | "heat" | "cred" | "tech";
}> = ({ label, value, max = 100, type }) => {
  const pct = Math.min(100, (value / max) * 100);
  const isCritical = (type === "rage" || type === "heat") && value >= 80;
  const isLow = type === "cred" && value <= 20;
  const displayValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

  return (
    <div className="flex-1 min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`text-sm font-bold ${isCritical || isLow ? "text-red-400" : "text-slate-200"}`}>
          {displayValue}
        </span>
      </div>
      <div className={`meter-bar meter-${type} ${isCritical ? "critical" : ""}`}>
        <div
          className="meter-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <div className="stat-display">
    <span className="stat-label">{label}</span>
    <span className={`stat-value ${highlight ? "text-emerald-400" : ""}`}>{value}</span>
  </div>
);

export const TopPanel: React.FC<Props> = ({ state, maxTurns, showDescription = true }) => {
  const { tokenPrice, tvl, officialTreasury, siphoned, rage, heat, cred, techHype } = state;
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
          {authenticated && commanderName && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-sky-400 font-mono uppercase tracking-wider">
                CDR. {commanderName}
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Online" />
            </div>
          )}
          {showDescription && (
            <p className="text-xs text-slate-400 leading-snug mt-1 max-w-md">
              Build humanity's legacy on Mars in {maxTurns} cycles without triggering mutiny or mission shutdown.
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tabular-nums">
            {state.turn}<span className="text-slate-500">/{maxTurns}</span>
          </div>
          <div className="text-[10px] uppercase text-slate-500">{THEME.ui.turn}</div>
        </div>
      </div>

      {/* Legacy Score - Hero Stat */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-4">
        <span className="text-3xl">🏛️</span>
        <div>
          <div className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">{THEME.ui.score}</div>
          <div className="text-emerald-300 text-2xl font-bold tabular-nums">{formatMoney(siphoned)}</div>
        </div>
      </div>

      {/* Colony Stats */}
      <div className="game-card">
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Colony Reserves" value={formatMoney(officialTreasury)} />
          <StatBox label="Mission Value" value={formatTokenPrice(tokenPrice)} />
          <StatBox label="Infrastructure" value={formatMoney(tvl)} />
        </div>
      </div>

      {/* Meter Bars */}
      <div className="game-card">
        <div className="flex flex-wrap gap-4">
          <MeterBar label="Crew Unrest" value={rage} type="rage" />
          <MeterBar label="Earth Oversight" value={heat} type="heat" />
          <MeterBar label="Command Trust" value={cred} type="cred" />
          <MeterBar label="Research Momentum" value={techHype} type="tech" />
        </div>
      </div>
    </div>
  );
};
