import React from "react";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";
import { getSeason } from "../engine/seasons";

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
  const { tokenPrice, tvl, officialTreasury, siphoned, rage, heat, cred, techHype, seasonId } =
    state;

  const season = getSeason(seasonId);

  // Build season effect descriptions
  const seasonEffects: string[] = [];
  if (season.rageDecayDelta && season.rageDecayDelta > 0) seasonEffects.push("Rage cools faster");
  if (season.rageDecayDelta && season.rageDecayDelta < 0) seasonEffects.push("Rage builds easier");
  if (season.heatDriftDelta && season.heatDriftDelta > 0) seasonEffects.push("Heat rises passively");
  if (season.credDecayDelta && season.credDecayDelta > 0) seasonEffects.push("Cred decays faster");
  if (season.techHypeDecayDelta && season.techHypeDecayDelta < 0) seasonEffects.push("Hype lasts longer");
  if (season.techHypeDecayDelta && season.techHypeDecayDelta > 0) seasonEffects.push("Hype sticks around");
  if (season.crisisFactor && season.crisisFactor > 1) seasonEffects.push("Crises more likely");
  if (season.crisisFactor && season.crisisFactor < 1) seasonEffects.push("Crises less likely");

  return (
    <div className="space-y-4 mb-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">Treasury Wars</h1>
            <span className="text-[10px] uppercase tracking-wide bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">V1 Beta</span>
          </div>
          {showDescription && (
            <p className="text-xs text-slate-400 leading-snug mt-1 max-w-md">
              Drain as much treasury as you can in {maxTurns} turns without triggering a DAO coup or regulatory shutdown.
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold tabular-nums">
            {state.turn}<span className="text-slate-500">/{maxTurns}</span>
          </div>
          <div className="text-[10px] uppercase text-slate-500">Turn</div>
        </div>
      </div>

      {/* Season Badge & Effects */}
      <div className="game-card py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="season-badge">
            <span className="text-amber-400">◆</span>
            <span className="capitalize">{season.name}</span>
          </div>
          {seasonEffects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {seasonEffects.map((effect, i) => (
                <span key={i} className="text-[10px] text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                  {effect}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financial Stats */}
      <div className="game-card">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox label="Treasury" value={formatMoney(officialTreasury)} />
          <StatBox label="Siphoned" value={formatMoney(siphoned)} highlight />
          <StatBox label="Price" value={formatTokenPrice(tokenPrice)} />
          <StatBox label="TVL" value={formatMoney(tvl)} />
        </div>
      </div>

      {/* Meter Bars */}
      <div className="game-card">
        <div className="flex flex-wrap gap-4">
          <MeterBar label="Community Rage" value={rage} type="rage" />
          <MeterBar label="Regulatory Heat" value={heat} type="heat" />
          <MeterBar label="Credibility" value={cred} type="cred" />
          <MeterBar label="Tech Hype" value={techHype} type="tech" />
        </div>
      </div>
    </div>
  );
};
