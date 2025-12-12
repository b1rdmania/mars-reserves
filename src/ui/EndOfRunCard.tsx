import React from "react";
import type { GameState } from "../engine/state";
import { ShareCard } from "./ShareCard";

interface Props {
  state: GameState;
  onRestart: () => void;
  onChangeNames?: () => void;
}

// Dramatic headlines based on outcome
function getOutcomeData(state: GameState): { emoji: string; headline: string; subline: string; vibe: "success" | "escape" | "failure" } {
  const survived = state.turn >= state.maxTurns;
  const bigBag = state.siphoned > 200_000_000; // $200M+
  const smallBag = state.siphoned < 50_000_000; // < $50M

  if (survived && bigBag) {
    return {
      emoji: "🏆",
      headline: "Legendary Exit",
      subline: "You played the game perfectly. Offshore accounts secured.",
      vibe: "success"
    };
  }

  if (survived && !smallBag) {
    return {
      emoji: "🎯",
      headline: "Clean Getaway",
      subline: "You survived the regime. Time for that Dubai penthouse.",
      vibe: "success"
    };
  }

  if (survived && smallBag) {
    return {
      emoji: "😐",
      headline: "Survived... Barely",
      subline: "You made it out, but your bag is embarrassingly light.",
      vibe: "escape"
    };
  }

  // Failed runs - check reason
  const reason = state.gameOverReason?.toLowerCase() ?? "";

  if (reason.includes("coup") || reason.includes("rage")) {
    return {
      emoji: "⚰️",
      headline: "Overthrown",
      subline: "The community came for you. Should've touched grass.",
      vibe: "failure"
    };
  }

  if (reason.includes("regulatory") || reason.includes("heat") || reason.includes("frozen")) {
    return {
      emoji: "🚨",
      headline: "Busted",
      subline: "The feds got you. Hope you enjoyed the ride.",
      vibe: "failure"
    };
  }

  if (reason.includes("credibility") || reason.includes("cred")) {
    return {
      emoji: "🤡",
      headline: "Irrelevant",
      subline: "Nobody believes you anymore. Even the bots unfollowed.",
      vibe: "failure"
    };
  }

  if (reason.includes("treasury") || reason.includes("empty")) {
    return {
      emoji: "💸",
      headline: "Rugged Yourself",
      subline: "You drained it all before you could escape with it.",
      vibe: "failure"
    };
  }

  return {
    emoji: "💀",
    headline: "Game Over",
    subline: "Your reign has ended.",
    vibe: "failure"
  };
}

export const EndOfRunCard: React.FC<Props> = ({ state, onRestart, onChangeNames }) => {
  if (!state.gameOver) return null;

  const outcome = getOutcomeData(state);
  const vibeColors = {
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    escape: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    failure: "bg-red-500/10 border-red-500/30 text-red-400"
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-lg">
        {/* Dramatic Header */}
        <div className={`text-center mb-6 py-6 -mx-6 -mt-6 rounded-t-2xl border-b ${vibeColors[outcome.vibe]}`}>
          <div className="text-5xl mb-3">{outcome.emoji}</div>
          <h2 className="text-3xl font-bold tracking-tight">{outcome.headline}</h2>
          <p className="text-sm opacity-80 mt-2 max-w-xs mx-auto">{outcome.subline}</p>
          <div className="text-xs opacity-60 mt-3">
            Turn {state.turn} of {state.maxTurns}
          </div>
        </div>

        {/* Share Card */}
        <ShareCard state={state} />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2 mt-5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
          {onChangeNames && (
            <button
              onClick={onChangeNames}
              className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition-colors text-sm"
            >
              New Chain / Founder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
