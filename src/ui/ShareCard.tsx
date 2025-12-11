import React from "react";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";

interface Props {
  state: GameState;
}

export const ShareCard: React.FC<Props> = ({ state }) => {
  const topLog = state.log.slice(0, 3);
  const reason = state.gameOverReason ?? "Run over";

  return (
    <div className="mt-3 bg-[#0f1117] border border-[#1c1f27] rounded-[10px] p-3 text-[12px] text-slate-200 font-mono space-y-2">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[11px] uppercase text-slate-400">Treasury Wars v1.0</div>
          <div className="text-base font-bold">Run Summary</div>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          Turn {state.turn}/{state.maxTurns}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-[#12151c] rounded-[8px] p-2 border border-[#1c1f27]">
          <div className="text-[10px] text-slate-400 uppercase">Siphoned</div>
          <div className="text-lg font-bold text-emerald-300">{formatMoney(state.siphoned)}</div>
        </div>
        <div className="bg-[#12151c] rounded-[8px] p-2 border border-[#1c1f27]">
          <div className="text-[10px] text-slate-400 uppercase">Treasury</div>
          <div className="text-lg font-bold text-slate-200">{formatMoney(state.officialTreasury)}</div>
        </div>
        <div className="bg-[#12151c] rounded-[8px] p-2 border border-[#1c1f27]">
          <div className="text-[10px] text-slate-400 uppercase">Price</div>
          <div className="text-lg font-bold">{formatTokenPrice(state.tokenPrice)}</div>
        </div>
        <div className="bg-[#12151c] rounded-[8px] p-2 border border-[#1c1f27]">
          <div className="text-[10px] text-slate-400 uppercase">TVL</div>
          <div className="text-lg font-bold">{formatMoney(state.tvl)}</div>
        </div>
      </div>

      <div className="text-[11px] text-amber-200">Cause: {reason}</div>

      <div>
        <div className="text-[10px] uppercase text-slate-400 mb-1">Highlights</div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-200">
          {topLog.length ? (
            topLog.map((line, idx) => <li key={idx}>{line}</li>)
          ) : (
            <li>No scandals logged.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

