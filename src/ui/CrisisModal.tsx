import React from "react";
import type { CrisisDef } from "../engine/crises";

interface Props {
  crisis: CrisisDef | null;
  onResolve: (optionId: string) => void;
}

function getSeverityStyle(severity: string): { badge: string; border: string } {
  switch (severity) {
    case "legendary":
      return { badge: "border border-[#7c3aed] text-[#a78bfa] bg-transparent", border: "border-[#7c3aed]" };
    case "high":
      return { badge: "border border-[#dc2626] text-[#f87171] bg-transparent", border: "border-[#dc2626]" };
    case "medium":
      return { badge: "border border-[#ea580c] text-[#fb923c] bg-transparent", border: "border-[#ea580c]" };
    default:
      return { badge: "border border-[#d97706] text-[#fbbf24] bg-transparent", border: "border-[#d97706]" };
  }
}

export const CrisisModal: React.FC<Props> = ({ crisis, onResolve }) => {
  if (!crisis) return null;

  const style = getSeverityStyle(crisis.severity);

  return (
    <div className="modal-backdrop crisis-modal">
      <div className={`modal-content ${style.border} border-2`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-[#dc2626] mb-1">⚠ Crisis Event</div>
            <h2 className="text-base font-semibold text-[#c8cdd5]">{crisis.name}</h2>
          </div>
          <span className={`px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] font-semibold ${style.badge}`}>
            {crisis.severity}
          </span>
        </div>

        {/* Description */}
        <div className="text-[11px] text-[#8b95a5] bg-[#0a0c10] border border-[#1a1f28] p-3 mb-4 leading-relaxed">
          {crisis.description}
        </div>

        {/* Options */}
        <div className="text-[9px] uppercase tracking-[0.12em] text-[#4a5565] mb-2">Select Response</div>
        <div className="space-y-1.5">
          {crisis.options.map((opt) => (
            <button
              key={opt.id}
              className="w-full text-left px-3 py-2.5 bg-[#0d0f13] hover:bg-[#12151c] text-xs border border-[#1a1f28] hover:border-[#2d3544] min-h-[44px]"
              onClick={() => onResolve(opt.id)}
            >
              <span className="text-[#c8cdd5]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
