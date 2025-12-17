import React from "react";
import type { GameState } from "../engine/state";
import { formatMillions } from "./format";

export const StatsBoard: React.FC<{ state: GameState }> = ({ state }) => {
  const items: Array<[string, React.ReactNode]> = [
    ["CYCLE", state.turn],
    ["COLONY", `${state.chainName}`],
    ["RESERVES", `${formatMillions(state.colonyReserves)} units`],
    ["LEGACY", `${formatMillions(state.legacy)}`],
    ["UNREST", state.rage],
    ["OVERSIGHT", state.oversightPressure],
    ["TRUST", state.cred],
    ["MOMENTUM", state.techHype],
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-3 font-mono text-[10px]">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="border border-[#1a1f28] bg-[#0d0f13] px-2 py-1.5"
        >
          <div className="text-[9px] text-[#4a5565] uppercase tracking-[0.1em]">{label}</div>
          <div className="text-xs font-medium text-[#8b95a5]">{value}</div>
        </div>
      ))}
    </div>
  );
};
