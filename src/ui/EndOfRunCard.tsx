import React, { useState } from "react";
import type { GameState } from "../engine/state";
import { evaluateEnding, getFallbackEnding } from "../engine/endings";
import { RecordMissionModal } from "./RecordMissionModal";
import { calculateFinalScore, formatScore } from "../engine/scoring";

interface Props {
  state: GameState;
  onRestart: () => void;
  onBackToHome?: () => void;
  onChangeNames?: () => void;
  seed?: number;
  actionIds?: string[];
}

export const EndOfRunCard: React.FC<Props> = ({ state, onRestart, onBackToHome, seed = 0, actionIds = [] }) => {
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

          {/* SECTION 1: THE VERDICT */}
          <div className="py-6">
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#64748b] mb-4">Mission Complete</div>
            <h2 className="text-xl font-semibold tracking-wide uppercase mb-2 text-[#c8cdd5]">
              {ending.headline}
            </h2>
            <p className="text-[11px] text-[#707d91] mb-6">{ending.subline}</p>

            {/* The verdict narrative */}
            <p className="text-[11px] text-[#94a3b8] leading-relaxed px-4">
              "{ending.narrative}"
            </p>
          </div>

          {/* SECTION 2: THE RECORD */}
          <div className="border-t border-b border-[#1a1f28] py-3 mb-6">
            <div className="text-[9px] uppercase tracking-[0.12em] text-[#64748b] mb-1">Final Legacy</div>
            <div className="text-lg font-semibold text-[#16a34a] font-mono">{formatScore(finalScore)}</div>
          </div>

          {/* SECTION 3: RECORD MISSION */}
          <button
            onClick={() => setShowRecordModal(true)}
            className="w-full py-3 px-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold uppercase tracking-[0.2em] text-xs transition-colors"
          >
            RECORD MISSION
            <span className="block text-[8px] font-normal text-[#16a34a]/30 mt-0.5 tracking-widest uppercase">Permanent • Verified</span>
          </button>

          {/* SECTION 4: TRY AGAIN */}
          <button
            onClick={onRestart}
            className="mt-6 text-[10px] text-[#64748b] hover:text-[#707d91] font-bold uppercase tracking-[0.2em] transition-colors"
          >
            [ REPLAY INITIAL_MISSION ]
          </button>

        </div>
      </div>

      {/* Record Mission Modal */}
      <RecordMissionModal
        open={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onBackToHome={onBackToHome}
        state={state}
        ending={ending}
        seed={seed}
        actionIds={actionIds}
      />
    </>
  );
};
