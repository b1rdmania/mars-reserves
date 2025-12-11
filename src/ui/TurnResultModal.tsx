import React from "react";
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

function formatDelta(delta: number, unit?: string) {
  const sign = delta >= 0 ? "+" : "";
  const val = Number.isInteger(delta) ? delta : delta.toFixed(1);
  return `${sign}${val}${unit ?? ""}`;
}

export const TurnResultModal: React.FC<Props> = ({ open, onClose, actionName, severity, deltas, logLine }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30">
      <div className="bg-[#12151c] border border-[#1c1f27] rounded-[10px] p-5 w-full max-w-lg space-y-3 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs uppercase text-slate-400">Turn Result</div>
            <div className="text-lg font-bold font-mono">{actionName}</div>
          </div>
          {severity && (
            <div className="text-right text-xs">
              <div className="uppercase text-[10px] text-slate-400">Severity</div>
              <div className="font-semibold">
                {severity.label} ({severity.roll}/6)
              </div>
            </div>
          )}
        </div>

        {logLine && <div className="text-[11px] text-slate-300">{logLine}</div>}

        <div className="space-y-1 text-sm">
          {deltas.map((d) => (
            <div key={d.label} className="flex justify-between">
              <span className="text-slate-300">{d.label}</span>
              <span className={d.delta >= 0 ? "text-sky-300" : "text-rose-300"}>
                {formatDelta(d.delta, d.unit)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-sky-500 hover:bg-sky-400 text-sm font-semibold px-4 py-2"
          >
            Next turn
          </button>
        </div>
      </div>
    </div>
  );
};

