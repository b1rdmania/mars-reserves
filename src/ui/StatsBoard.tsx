import React from "react";
import type { GameState } from "../engine/state";
import { formatMillions } from "./format";

export const StatsBoard: React.FC<{ state: GameState }> = ({ state }) => {
  const items: Array<[string, React.ReactNode]> = [
    ["TURN", state.turn],
    ["CHAIN", `${state.chainName} (${state.ticker})`],
    ["PRICE", `$${state.tokenPrice.toFixed(2)}`],
    ["TVL", `$${formatMillions(state.tvl)}`],
    ["TREASURY", `$${formatMillions(state.colonyReserves)}`],
    ["LEGACY", `$${formatMillions(state.legacy)}`],
    ["RAGE", state.rage],
    ["HEAT", state.oversightPressure],
    ["CRED", state.cred],
    ["TECH", state.techHype],
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 font-mono text-[11px]">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-[2px] border border-[#1c1f27] bg-[#0f1117] px-2 py-2 leading-tight"
        >
          <div className="text-[10px] text-slate-400 tracking-wide">{label}</div>
          <div className="text-sm font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
};


