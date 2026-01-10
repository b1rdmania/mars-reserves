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

function getSeverityStyle(label: string): string {
  switch (label) {
    case "Critical":
      return "border-[#dc2626] text-[#f87171]";
    case "Glancing":
      return "border-[#64748b] text-[#94a3b8]";
    default:
      return "border-[#d97706] text-[#fbbf24]";
  }
}

function isNegativeDelta(label: string, delta: number): boolean {
  const badWhenUp = label.toLowerCase().includes("unrest") || label.toLowerCase().includes("oversight");
  if (badWhenUp) return delta > 0;
  return delta < 0;
}

export const TurnResultModal: React.FC<Props> = ({ open, onClose, actionName, severity, deltas, logLine }) => {
  if (!open) return null;

  const hasNegative = deltas.some((d) => isNegativeDelta(d.label, d.delta));
  const hasSiphoned = deltas.some((d) => d.label.toLowerCase().includes("legacy") && d.delta > 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Severity Banner */}
        {severity && (
          <div className={`flex items-center justify-center gap-2 py-1.5 px-3 mb-4 border ${getSeverityStyle(severity.label)}`}>
            <span className="font-semibold uppercase tracking-[0.12em] text-[10px]">
              {severity.label} Hit
            </span>
          </div>
        )}

        {/* Action Name */}
        <h2 className="text-base font-semibold text-center mb-3 text-[#c8cdd5] uppercase tracking-wide">
          {actionName}
        </h2>

        {/* Narrative Box */}
        {logLine && (
          <div className="bg-[#0a0c10] border border-[#1a1f28] p-3 mb-4">
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              "{logLine}"
            </p>
          </div>
        )}

        {/* Resources Secured Callout */}
        {hasSiphoned && (
          <div className="border-l-2 border-l-[#16a34a] bg-[#0a0c10] p-2.5 mb-3 flex items-center gap-2">
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-[#64748b]">Resources Secured</div>
              <div className="text-[#16a34a] text-sm font-semibold font-mono">
                {formatDelta(deltas.find(d => d.label.toLowerCase().includes("legacy"))?.delta ?? 0, undefined, "legacy")}
              </div>
            </div>
          </div>
        )}

        {/* Stat Changes */}
        {deltas.length > 0 && (() => {
          const narrativeStats = deltas.filter((d) => {
            const l = d.label.toLowerCase();
            if (l.includes("treasury") || l.includes("legacy")) return false;
            return true;
          });

          if (narrativeStats.length === 0) return null;

          return (
            <div className="grid grid-cols-2 gap-1 mb-4">
              {narrativeStats.map((d) => {
                const isNeg = isNegativeDelta(d.label, d.delta);
                return (
                  <div
                    key={d.label}
                    className={`flex items-center justify-between p-2 border ${isNeg ? "border-[#dc2626]/30 bg-[#dc2626]/5" : "border-[#1a1f28]"}`}
                  >
                    <span className="text-[10px] text-[#707d91] uppercase tracking-wide">{d.label}</span>
                    <span className={`text-xs font-semibold tabular-nums font-mono ${isNeg ? "text-[#f87171]" : "text-[#16a34a]"}`}>
                      {formatDelta(d.delta, d.unit, d.label)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Ominous Message */}
        <div className="text-center text-[9px] text-[#64748b] mb-3 uppercase tracking-wide">
          {(() => {
            const messages = [
              "Earth is reviewing this.",
              "Crew sentiment logged.",
              "This will be remembered.",
              "Oversight has noted this.",
              "This incident has been archived.",
            ];
            const hash = (actionName.length + deltas.length) % messages.length;
            return messages[hash];
          })()}
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 px-4 font-medium uppercase tracking-wider text-xs ${hasNegative
            ? "bg-[#0d0f13] hover:bg-[#12151c] text-[#94a3b8] border border-[#1a1f28]"
            : "bg-[#0891b2] hover:bg-[#0e7490] text-white"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
