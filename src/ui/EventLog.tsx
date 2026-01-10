import React, { useState } from "react";

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
  // Party emoji for celebrations
  if (line.toLowerCase().includes("celebrate")) return "🎉";
  return "►";
};

const classForLine = (line: string) => {
  const lower = line.toLowerCase();
  // Positive events (green)
  if (lower.includes("siphon") || lower.includes("celebrate") || lower.includes("milestone"))
    return "text-[#16a34a]";
  // Gains/improvements (cyan)
  if (lower.includes("cred") || lower.includes("hype") || lower.includes("morale") || lower.includes("improve"))
    return "text-[#0891b2]";
  // Negative events (red)
  if (lower.includes("meltdown") || lower.includes("heat") || lower.includes("rage") || lower.includes("exploit"))
    return "text-[#dc2626]";
  // Warnings/crises (amber)
  if (line.startsWith("[CRISIS]") || lower.includes("critical"))
    return "text-[#d97706]";
  // Default (muted grey)
  return "text-[#94a3b8]";
};

export const EventLog: React.FC<Props> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show last 2 entries when collapsed, all when expanded
  const displayLog = isExpanded ? log : log.slice(-2);
  const hasMore = log.length > 2;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-[0.12em] text-[#64748b] font-semibold">Event Log</span>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[8px] uppercase tracking-wider text-[#64748b] hover:text-[#0891b2] transition-colors font-medium"
          >
            {isExpanded ? `COLLAPSE` : `SHOW ALL (${log.length})`}
          </button>
        )}
      </div>
      <div className={`bg-[#0a0c10] border border-[#1a1f28] p-2.5 ${isExpanded ? 'max-h-44 overflow-y-auto' : ''} text-[10px] leading-relaxed`}>
        {displayLog.map((line, idx) => (
          <div key={idx} className="mb-1.5 last:mb-0 flex gap-2 items-start">
            <span className="text-[#64748b] shrink-0">{iconForLine(line)}</span>
            <span className={classForLine(line)}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
