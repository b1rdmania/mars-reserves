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

// Explain WHY the game ended
function getGameOverReason(state: GameState): string | null {
  if (state.turn >= state.maxTurns) {
    return "Mission completed — you survived all cycles.";
  }
  if (state.rage >= 100) {
    return "Crew unrest reached critical levels.";
  }
  if (state.oversightPressure >= 100) {
    return "Earth oversight terminated the mission.";
  }
  if (state.cred <= 0) {
    return "Command trust collapsed entirely.";
  }
  if (state.colonyReserves <= 0) {
    return "Colony reserves were depleted.";
  }
  return null;
}

export const EndOfRunCard: React.FC<Props> = ({ state, onRestart, onChangeNames, seed = 0, actionIds = [] }) => {
  const [showRecordModal, setShowRecordModal] = useState(false);

  if (!state.gameOver) return null;

  const ending = evaluateEnding(state) ?? getFallbackEnding(state);
  const vibeColors = getVibeColors(ending);
  const gameOverReason = getGameOverReason(state);

  // Calculate legacy for the verdict strip
  const scoring = calculateFinalScore(state);
  const endingMultiplier = ending?.scoreMultiplier ?? 1;
  const finalScore = scoring.finalScore * endingMultiplier;
  const initialReserves = 1_000_000_000;
  const extractionRate = ((state.legacy / initialReserves) * 100).toFixed(0);

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-content max-w-md">

          {/* SECTION 1: THE OUTCOME (dominant) */}
          <div className={`text-center py-5 -mx-6 -mt-6 rounded-t-2xl border-b ${vibeColors}`}>
            <div className="text-4xl mb-2">{ending.emoji}</div>
            <h2 className="text-2xl font-bold tracking-tight px-4">{ending.headline}</h2>
            <p className="text-sm opacity-80 mt-1 px-4">{ending.subline}</p>
          </div>

          {/* Why this happened - subtle context */}
          {gameOverReason && (
            <div className="text-center text-xs text-slate-500 mt-4">
              {gameOverReason}
            </div>
          )}

          {/* THE NARRATIVE (the star - let it breathe) */}
          <div className="my-4 px-2">
            <p className="text-sm text-slate-300 leading-relaxed italic text-center">
              "{ending.narrative}"
            </p>
          </div>

          {/* SECTION 2: THE VERDICT (compact, not celebratory) */}
          <div className="bg-slate-800/40 rounded-lg px-4 py-3 border border-slate-700/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Legacy recorded:</span>
              <span className="text-slate-200 font-mono">{formatScore(finalScore)}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 text-right">
              {extractionRate}% of colony reserves redirected
            </div>
          </div>

          {/* SECTION 3: THE ARCHIVE HOOK */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500 italic mb-3">
              This mission can be entered into the Colony Archive.
            </p>
            <button
              onClick={() => setShowRecordModal(true)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-base"
            >
              📡 Record Mission
            </button>
          </div>

          {/* SECTION 4: SECONDARY ACTIONS (demoted) */}
          <div className="mt-4 pt-3 border-t border-slate-700/30">
            <div className="flex gap-2">
              <button
                onClick={onRestart}
                className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors text-sm"
              >
                Try Again
              </button>
              {onChangeNames && (
                <button
                  onClick={onChangeNames}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium rounded-lg transition-colors text-xs"
                >
                  New
                </button>
              )}
            </div>
          </div>

          {/* Badge - only if earned, small */}
          {ending.badge && (
            <div className="mt-3 text-center">
              <span className="inline-block px-2 py-1 rounded-full bg-slate-800 text-[10px] text-slate-400 uppercase tracking-wide">
                🏷️ {ending.badge}
              </span>
            </div>
          )}
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
