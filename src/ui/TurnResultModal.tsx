import React from "react";
import { formatMoney, formatTokenPrice } from "./format";
import type { SeverityResult } from "../engine/severity";

interface DeltaEntry {
  label: string;
  delta: number;
  unit?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  actionName: string;
  severity: SeverityResult | null;
  deltas: DeltaEntry[];
  logLine?: string;
}

function formatDelta(delta: number, unit?: string, label?: string) {
  const moneyLike =
    label &&
    (label.toLowerCase().includes("treasury") ||
      label.toLowerCase().includes("legacy") ||
      label.toLowerCase().includes("tvl"));
  const isPrice = label?.toLowerCase().includes("price");
  const sign = delta >= 0 ? "+" : "";
  if (moneyLike) {
    return `${sign}${formatMoney(Math.abs(delta))}`;
  }
  if (isPrice) {
    return `${sign}${formatTokenPrice(Math.abs(delta))}`;
  }
  const val = Number.isInteger(delta) ? delta : delta.toFixed(1);
  return `${sign}${val}${unit ?? ""}`;
}

function getSeverityEmoji(label: string): string {
  switch (label) {
    case "Critical":
      return "💀";
    case "Glancing":
      return "😌";
    default:
      return "⚡";
  }
}

function getSeverityColor(label: string): string {
  switch (label) {
    case "Critical":
      return "text-red-400 bg-red-500/20 border-red-500/30";
    case "Glancing":
      return "text-slate-400 bg-slate-500/20 border-slate-500/30";
    default:
      return "text-amber-400 bg-amber-500/20 border-amber-500/30";
  }
}

function isNegativeDelta(label: string, delta: number): boolean {
  const badWhenUp = label.toLowerCase().includes("rage") || label.toLowerCase().includes("heat");
  if (badWhenUp) return delta > 0;
  return delta < 0;
}

function getStatEmoji(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("treasury")) return "🏦";
  if (l.includes("legacy")) return "💰";
  if (l.includes("rage")) return "😤";
  if (l.includes("heat")) return "🔥";
  if (l.includes("cred")) return "⭐";
  if (l.includes("tech")) return "🚀";
  if (l.includes("price")) return "📈";
  if (l.includes("tvl")) return "💧";
  return "•";
}

export const TurnResultModal: React.FC<Props> = ({ open, onClose, actionName, severity, deltas, logLine }) => {
  if (!open) return null;

  // Determine overall vibe for the card
  const hasNegative = deltas.some((d) => isNegativeDelta(d.label, d.delta));
  const hasSiphoned = deltas.some((d) => d.label.toLowerCase().includes("legacy") && d.delta > 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Severity Banner */}
        {severity && (
          <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg mb-4 border ${getSeverityColor(severity.label)}`}>
            <span className="text-xl">{getSeverityEmoji(severity.label)}</span>
            <span className="font-semibold uppercase tracking-wide text-sm">
              {severity.label} Hit
            </span>
          </div>
        )}

        {/* Action Name - Big & Bold */}
        <h2 className="text-2xl font-bold text-center mb-4 leading-tight">
          {actionName}
        </h2>

        {/* Narrative Box - THE STAR OF THE SHOW */}
        {logLine && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 mb-5 border border-slate-700/50">
            <p className="text-base text-slate-200 leading-relaxed italic">
              "{logLine}"
            </p>
          </div>
        )}

        {/* Siphoned Callout - Resources secured */}
        {hasSiphoned && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4 flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">Resources Secured</div>
              <div className="text-emerald-300 text-lg font-bold">
                {formatDelta(deltas.find(d => d.label.toLowerCase().includes("legacy"))?.delta ?? 0, undefined, "legacy")}
              </div>
            </div>
          </div>
        )}

        {/* Stat Changes - Only show narrative-relevant stats */}
        {deltas.length > 0 && (() => {
          // Filter to only show: Rage, Oversight, Cred, Tech, Price, TVL (hide Treasury/Legacy)
          const narrativeStats = deltas.filter((d) => {
            const l = d.label.toLowerCase();
            if (l.includes("treasury") || l.includes("legacy")) return false;
            return true;
          });

          if (narrativeStats.length === 0) return null;

          return (
            <div className="grid grid-cols-2 gap-2 mb-5">
              {narrativeStats.map((d) => {
                const isNeg = isNegativeDelta(d.label, d.delta);
                return (
                  <div
                    key={d.label}
                    className={`flex items-center justify-between p-2 rounded-lg ${isNeg ? "bg-red-500/10" : "bg-slate-800/50"
                      }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>{getStatEmoji(d.label)}</span>
                      <span>{d.label}</span>
                    </span>
                    <span className={`text-sm font-bold tabular-nums ${isNeg ? "text-red-400" : "text-emerald-400"}`}>
                      {formatDelta(d.delta, d.unit, d.label)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-3.5 px-4 font-semibold rounded-xl transition-all text-base ${hasNegative
            ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
            : "bg-sky-500 hover:bg-sky-400 text-white"
            }`}
        >
          {hasNegative ? "Survive Another Turn →" : "Next Turn →"}
        </button>
      </div>
    </div>
  );
};
