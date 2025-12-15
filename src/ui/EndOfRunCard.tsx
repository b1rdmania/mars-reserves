import React, { useState } from "react";
import type { GameState } from "../engine/state";
import { ShareCard } from "./ShareCard";
import { evaluateEnding, getFallbackEnding, type EndingDef } from "../engine/endings";
import { RecordMissionModal } from "./RecordMissionModal";

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

export const EndOfRunCard: React.FC<Props> = ({ state, onRestart, onChangeNames, seed = 0, actionIds = [] }) => {
  const [showRecordModal, setShowRecordModal] = useState(false);

  if (!state.gameOver) return null;

  const ending = evaluateEnding(state) ?? getFallbackEnding(state);
  const vibeColors = getVibeColors(ending);

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-content max-w-md">
          {/* Compact Header */}
          <div className={`text-center py-4 -mx-6 -mt-6 rounded-t-2xl border-b ${vibeColors}`}>
            <div className="text-4xl mb-1">{ending.emoji}</div>
            <h2 className="text-2xl font-bold tracking-tight">{ending.headline}</h2>
            <p className="text-xs opacity-80 mt-1">{ending.subline}</p>
            {ending.badge && (
              <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-black/20 text-[10px] uppercase tracking-wide">
                🏷️ {ending.badge}
              </div>
            )}
          </div>

          {/* Compact Narrative */}
          <div className="bg-slate-800/50 rounded-lg p-3 my-3 border border-slate-700/50">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{ending.narrative}"
            </p>
          </div>

          {/* Share Card - condensed */}
          <ShareCard state={state} ending={ending} />

          {/* Record Mission CTA */}
          <button
            onClick={() => setShowRecordModal(true)}
            className="w-full mt-3 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>Record Mission</span>
          </button>

          {/* Compact Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onRestart}
              className="flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Try Again
            </button>
            {onChangeNames && (
              <button
                onClick={onChangeNames}
                className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl transition-colors text-xs"
              >
                New Mission
              </button>
            )}
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

