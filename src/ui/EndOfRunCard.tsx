import React, { useState } from "react";
import type { GameState } from "../engine/state";
import { evaluateEnding, getFallbackEnding, type EndingDef } from "../engine/endings";
import { RecordMissionModal } from "./RecordMissionModal";
import { calculateFinalScore, formatScore } from "../engine/scoring";

interface Props {
  state: GameState;
  onRestart: () => void;
  onChangeNames?: () => void;
  seed?: number;
  actionIds?: string[];
}

function getVibeColors(ending: EndingDef): string {
  const successIds = ["golden_age", "perfect_mission", "master_extractor", "research_pivot_works", "corporate_partnership", "become_legend", "communications_wizard", "bureaucracy_master", "crisis_survivor", "side_project_success", "fallback_success"];
  const escapeIds = ["forced_evacuation", "ironic_award", "fallback_survive"];

  if (successIds.includes(ending.id)) {
    return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  }
  if (escapeIds.includes(ending.id)) {
    return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  }
  return "bg-red-500/10 border-red-500/30 text-red-400";
}

export const EndOfRunCard: React.FC<Props> = ({ state, onRestart, seed = 0, actionIds = [] }) => {
  const [showRecordModal, setShowRecordModal] = useState(false);

  if (!state.gameOver) return null;

  const ending = evaluateEnding(state) ?? getFallbackEnding(state);
  const vibeColors = getVibeColors(ending);

  // Calculate legacy for the verdict
  const scoring = calculateFinalScore(state);
  const endingMultiplier = ending?.scoreMultiplier ?? 1;
  const finalScore = scoring.finalScore * endingMultiplier;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-content max-w-md">

          {/* SECTION 1: THE VERDICT (dominant, quiet, heavy) */}
          <div className={`text-center py-6 -mx-6 -mt-6 rounded-t-2xl border-b ${vibeColors}`}>
            <div className="text-4xl mb-3">{ending.emoji}</div>
            <h2 className="text-2xl font-bold tracking-tight px-4">{ending.headline}</h2>
            <p className="text-sm opacity-80 mt-1 px-4">{ending.subline}</p>
          </div>

          {/* THE NARRATIVE (the star - let it breathe) */}
          <div className="my-6 px-2">
            <p className="text-sm text-slate-300 leading-relaxed italic text-center">
              "{ending.narrative}"
            </p>
          </div>

          {/* SECTION 2: LEGACY (single neutral line, no box) */}
          <div className="text-center text-sm text-slate-400 mb-6">
            Legacy recorded: <span className="text-slate-200 font-mono">{formatScore(finalScore)}</span>
          </div>

          {/* SECTION 3: THE CHOICE (the star action) */}
          <button
            onClick={() => setShowRecordModal(true)}
            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-base"
          >
            Record Mission
            <span className="block text-xs font-normal text-emerald-200/60 mt-0.5">Archive permanently</span>
          </button>

          {/* SECTION 4: REPLAY (secondary, understated) */}
          <div className="mt-4 text-center">
            <button
              onClick={onRestart}
              className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
            >
              Try Again
            </button>
          </div>

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
