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
      label.toLowerCase().includes("siphoned") ||
      label.toLowerCase().includes("tvl") ||
      label.toLowerCase().includes("price"));
  const sign = delta >= 0 ? "+" : "";
  if (moneyLike) {
    const abs = Math.abs(delta);
    if (label?.toLowerCase().includes("price")) {
      return `${sign}${formatTokenPrice(abs)}`;
    }
    return `${sign}${formatMoney(abs)}`;
  }
  const val = Number.isInteger(delta) ? delta : delta.toFixed(1);
  return `${sign}${val}${unit ?? ""}`;
}

function getSeverityColor(label: string): string {
  switch (label) {
    case "Critical":
      return "text-red-400 bg-red-500/20";
    case "Glancing":
      return "text-slate-400 bg-slate-500/20";
    default:
      return "text-amber-400 bg-amber-500/20";
  }
}

function isNegativeDelta(label: string, delta: number): boolean {
  const badWhenUp = label.toLowerCase().includes("rage") || label.toLowerCase().includes("heat");
  if (badWhenUp) return delta > 0;
  return delta < 0;
}

export const TurnResultModal: React.FC<Props> = ({ open, onClose, actionName, severity, deltas, logLine }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Turn Result</div>
            <div className="text-xl font-bold">{actionName}</div>
          </div>
          {severity && (
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getSeverityColor(severity.label)}`}>
              {severity.label} ({severity.roll}/6)
            </div>
          )}
        </div>

        {/* Narrative */}
        {logLine && (
          <div className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 mb-4 leading-relaxed">
            {logLine}
          </div>
        )}

        {/* Stat Changes */}
        {deltas.length > 0 && (
          <div className="space-y-2 mb-6">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">Changes</div>
            {deltas.map((d) => {
              const isNeg = isNegativeDelta(d.label, d.delta);
              return (
                <div key={d.label} className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-400">{d.label}</span>
                  <span className={`text-base font-bold tabular-nums ${isNeg ? "text-red-400" : "text-emerald-400"}`}>
                    {formatDelta(d.delta, d.unit, d.label)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Next Turn →
        </button>
      </div>
    </div>
  );
};
