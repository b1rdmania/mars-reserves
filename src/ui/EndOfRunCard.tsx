import React, { useState } from "react";
import type { GameState } from "../engine/state";
import { evaluateEnding, getFallbackEnding } from "../engine/endings";
import { RecordMissionModal } from "./RecordMissionModal";
import { calculateFinalScore, formatScore } from "../engine/scoring";

interface Props {
  state: GameState;
  onRestart: () => void;
  onChangeNames?: () => void;
  seed?: number;
  actionIds?: string[];
}

export const EndOfRunCard: React.FC<Props> = ({ state, onRestart, seed = 0, actionIds = [] }) => {
  const [showRecordModal, setShowRecordModal] = useState(false);

  if (!state.gameOver) return null;

  const ending = evaluateEnding(state) ?? getFallbackEnding(state);

  // Calculate legacy for the record
  const scoring = calculateFinalScore(state);
  const endingMultiplier = ending?.scoreMultiplier ?? 1;
  const finalScore = scoring.finalScore * endingMultiplier;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-content max-w-md text-center">

          {/* SECTION 1: THE SENTENCE (this is the screen) */}
          <div className="py-8">
            <div className="text-5xl mb-4">{ending.emoji}</div>
            <h2 className="text-2xl font-bold tracking-tight uppercase mb-2">
              {ending.headline}
            </h2>
            <p className="text-sm text-slate-400 mb-6">{ending.subline}</p>

            {/* The quote - tightened and final */}
            <p className="text-sm text-slate-300 leading-relaxed italic px-4">
              "{ending.narrative}"
            </p>
          </div>

          {/* SECTION 2: THE RECORD (single line, neutral, no box) */}
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-8">
            Legacy entered into record: <span className="text-slate-300 font-mono">{formatScore(finalScore)}</span>
          </div>

          {/* SECTION 3: THE CHOICE (this is the only interaction) */}
          <button
            onClick={() => setShowRecordModal(true)}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Record Mission
            <span className="block text-xs font-normal text-emerald-200/50 mt-1">Permanent. Public.</span>
          </button>

          {/* SECTION 4: DEFIANCE (understated) */}
          <button
            onClick={onRestart}
            className="mt-6 text-sm text-slate-600 hover:text-slate-400 transition-colors"
          >
            Try Again
          </button>

        </div>
      </div>

      {/* Record Mission Modal */}
      <RecordMissionModal
        open={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        state={state}
        ending={ending}
        seed={seed}
        actionIds={actionIds}
      />
    </>
  );
};
