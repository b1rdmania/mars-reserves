import React, { useState } from "react";

interface Props {
  log: string[];
}

export const LogSection: React.FC<Props> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? log : log.slice(0, 2);

  return (
    <div className="mt-2">
      <div className="text-sm font-semibold mb-1 font-mono">Log</div>
      <div className="bg-[#12151c] border border-[#1c1f27] rounded-[6px] p-3 text-[11px] font-mono leading-tight max-h-56 overflow-y-auto">
        {shown.map((line, idx) => (
          <div key={idx} className="mb-1 flex gap-2 items-start">
            <span className="text-slate-500">►</span>
            <span className="text-slate-200">{line}</span>
          </div>
        ))}
        <button
          className="mt-1 text-[11px] underline text-slate-400"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show full log"}
        </button>
      </div>
    </div>
  );
};

