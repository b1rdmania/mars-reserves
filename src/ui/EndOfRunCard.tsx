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
    <div className="modal-backdrop">
      <div className="modal-content max-w-lg">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💀</div>
          <h2 className="text-2xl font-bold">Run Over</h2>
          <div className="text-sm text-slate-400 mt-1">
            Turn {state.turn}/{state.maxTurns}
          </div>
        </div>

        {/* Share Card */}
        <ShareCard state={state} />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2 mt-5">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Start New Run
          </button>
          {onChangeNames && (
            <button
              onClick={onChangeNames}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition-colors text-sm"
            >
              Change Chain / Founder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
