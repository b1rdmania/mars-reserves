import React from "react";

interface Props {
  log: string[];
}

const iconForLine = (line: string) => {
  if (line.startsWith("[CRISIS]")) return "⚠";
  if (line.toLowerCase().includes("meltdown") || line.toLowerCase().includes("exploit")) return "✖";
  if (line.toLowerCase().includes("welcome")) return "►";
  if (
    line.toLowerCase().includes("siphon") ||
    line.toLowerCase().includes("cred") ||
    line.toLowerCase().includes("hype")
  )
    return "★";
  if (line.startsWith("Critical")) return "✖";
  if (line.startsWith("Glancing") || line.startsWith("Normal")) return "►";
  return "►";
};

export const EventLog: React.FC<Props> = ({ log }) => {
  return (
    <div className="mt-3 bg-[#12151c] border border-[#1c1f27] rounded-[6px] p-3 h-44 overflow-y-auto text-[11px] font-mono leading-tight">
      {log.map((line, idx) => (
        <div key={idx} className="mb-1 flex gap-2 items-start">
          <span className="text-slate-500">{iconForLine(line)}</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
};

