import React from "react";
import type { CrisisDef } from "../engine/crises";

interface Props {
  crisis: CrisisDef | null;
  onResolve: (optionId: string) => void;
}

function getSeverityStyle(severity: string): { badge: string; border: string } {
  switch (severity) {
    case "legendary":
      return { badge: "bg-purple-500/20 text-purple-300", border: "border-purple-500" };
    case "high":
      return { badge: "bg-red-500/20 text-red-300", border: "border-red-500" };
    case "medium":
      return { badge: "bg-orange-500/20 text-orange-300", border: "border-orange-500" };
    default:
      return { badge: "bg-yellow-500/20 text-yellow-300", border: "border-yellow-500" };
  }
}

export const CrisisModal: React.FC<Props> = ({ crisis, onResolve }) => {
  if (!crisis) return null;

  const style = getSeverityStyle(crisis.severity);

  return (
    <div className="modal-backdrop crisis-modal">
      <div className={`modal-content ${style.border} border-2`}>
        {/* Header with warning icon */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Crisis Event</div>
              <h2 className="text-lg font-bold">{crisis.name}</h2>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-semibold ${style.badge}`}>
            {crisis.severity}
          </span>
        </div>

        {/* Description */}
        <div className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 mb-5 leading-relaxed">
          {crisis.description}
        </div>

        {/* Options */}
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-3">Choose Your Response</div>
        <div className="space-y-2">
          {crisis.options.map((opt) => (
            <button
              key={opt.id}
              className="w-full text-left rounded-xl px-4 py-3 bg-slate-800/70 hover:bg-slate-700/80 text-sm transition-all border border-slate-700/50 hover:border-slate-600 min-h-[52px]"
              onClick={() => onResolve(opt.id)}
            >
              <span className="text-slate-200">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
