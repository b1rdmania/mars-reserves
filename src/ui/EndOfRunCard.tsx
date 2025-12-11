import React from "react";
import type { GameState } from "../engine/state";
import { ShareCard } from "./ShareCard";

interface Props {
  state: GameState;
  onRestart: () => void;
  onChangeNames?: () => void;
}

export const EndOfRunCard: React.FC<Props> = ({ state, onRestart, onChangeNames }) => {
  if (!state.gameOver) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-30">
      <div className="bg-[#12151c] rounded-[10px] p-6 max-w-md w-full space-y-3 border border-[#1c1f27]">
        <h2 className="text-xl font-bold mb-1">Run Over</h2>
        <p className="text-sm text-slate-200">{state.gameOverReason}</p>
        <div className="text-sm mt-2 space-y-1">
          <div>
            <span className="font-semibold">Siphoned:</span> {state.siphoned}
          </div>
          <div>
            <span className="font-semibold">Turns survived:</span> {state.turn}
          </div>
          <div>
            <span className="font-semibold">Ending price:</span> ${state.tokenPrice.toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Recent scandals:</span>{" "}
            {state.recentEvents.length ? state.recentEvents.join(", ") : "None logged"}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-3">
          <button
            onClick={onRestart}
            className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 text-sm font-semibold py-2"
          >
            Start new run
          </button>
          {onChangeNames && (
            <button
              onClick={onChangeNames}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold py-2"
            >
              Change chain / founder
            </button>
          )}
        </div>

        <ShareCard state={state} />
      </div>
    </div>
  );
};

