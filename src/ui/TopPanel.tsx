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

      <div className="text-xs text-slate-200 space-y-1 font-mono">
        <div className="flex flex-wrap gap-2">
          <span>
            Turn {state.turn}/{maxTurns}
          </span>
          <span>Treasury {formatMoney(officialTreasury)}</span>
          <span>Siphoned {formatMoney(siphoned)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span>Price {formatTokenPrice(tokenPrice)}</span>
          <span>TVL {formatMoney(tvl)}</span>
          <span>Rage {rage}</span>
          <span>Heat {heat}</span>
          <span>Cred {cred}</span>
          <span>Tech {techHype}</span>
        </div>
        <div className="text-[11px] text-slate-400">Season: {prettySeason}</div>
      </div>
    </div>
  );
};

