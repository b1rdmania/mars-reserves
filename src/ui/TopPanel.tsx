import React from "react";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";

interface Props {
  state: GameState;
  maxTurns: number;
  showDescription?: boolean;
}

export const TopPanel: React.FC<Props> = ({ state, maxTurns, showDescription = true }) => {
  const { tokenPrice, tvl, officialTreasury, siphoned, rage, heat, cred, techHype, seasonId } =
    state;

  const prettySeason = seasonId.replace(/_/g, " ");

  return (
    <div className="space-y-1 mb-3">
      <div>
        <h1 className="text-2xl font-bold font-mono leading-tight">Treasury Wars v1.0</h1>
        {showDescription && (
          <p className="text-[11px] text-slate-400 leading-snug">
            Drain as much treasury into off-chain founder funds as you can in {maxTurns} turns without triggering a DAO
            coup or regulatory shutdown.
          </p>
        )}
      </div>

      <div className="text-xs text-slate-200 space-y-1 font-mono bg-[#12151c] border border-[#1c1f27] rounded-[8px] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Turn</span>
          <span>
            {state.turn}/{maxTurns}
          </span>
          <span className="text-slate-500">•</span>
          <span className="font-semibold">Treasury</span>
          <span>{formatMoney(officialTreasury)}</span>
          <span className="text-slate-500">•</span>
          <span className="font-semibold">Siphoned</span>
          <span>{formatMoney(siphoned)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Price <span className="font-semibold">{formatTokenPrice(tokenPrice)}</span>
          </span>
          <span>
            TVL <span className="font-semibold">{formatMoney(tvl)}</span>
          </span>
          <span className="flex items-center gap-1">
            Rage
            <span className="h-1.5 w-10 bg-slate-700 rounded overflow-hidden">
              <span className="block h-1.5 bg-red-500" style={{ width: `${Math.min(100, rage)}%` }} />
            </span>
            {rage}
          </span>
          <span className="flex items-center gap-1">
            Heat
            <span className="h-1.5 w-10 bg-slate-700 rounded overflow-hidden">
              <span className="block h-1.5 bg-orange-400" style={{ width: `${Math.min(100, heat)}%` }} />
            </span>
            {heat}
          </span>
          <span className="flex items-center gap-1">
            Cred
            <span className="h-1.5 w-10 bg-slate-700 rounded overflow-hidden">
              <span className="block h-1.5 bg-blue-400" style={{ width: `${Math.min(100, cred)}%` }} />
            </span>
            {cred}
          </span>
          <span className="flex items-center gap-1">
            Tech
            <span className="h-1.5 w-10 bg-slate-700 rounded overflow-hidden">
              <span className="block h-1.5 bg-sky-400" style={{ width: `${Math.min(100, techHype)}%` }} />
            </span>
            {techHype}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">Season: {prettySeason}</div>
      </div>
    </div>
  );
};

