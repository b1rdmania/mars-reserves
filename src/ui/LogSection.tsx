import React, { useState } from "react";

interface Props {
  log: string[];
}

export const LogSection: React.FC<Props> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? log : log.slice(0, 3);

  if (!log.length) return null;

  return (
    <div className="mt-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Event Log</span>
        {log.length > 3 && (
          <button
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : `Show all (${log.length})`}
          </button>
        )}
      </div>
      <div className="game-card max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {shown.map((line, idx) => {
            const isCrisis = line.includes("[CRISIS]");
            const isRecent = idx === 0;
            return (
              <div
                key={idx}
                className={`flex gap-2 items-start text-xs ${isRecent ? "text-slate-200" : "text-slate-400"
                  } ${isCrisis ? "text-orange-300" : ""}`}
              >
                <span className={`shrink-0 ${isCrisis ? "text-orange-400" : "text-slate-600"}`}>
                  {isCrisis ? "⚠" : "›"}
                </span>
                <span className="leading-relaxed">{line.replace("[CRISIS] ", "")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
