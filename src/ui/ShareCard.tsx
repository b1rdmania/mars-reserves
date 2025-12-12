import React from "react";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";
import { calculateFinalScore, formatScore } from "../engine/scoring";

interface Props {
  state: GameState;
}

export const ShareCard: React.FC<Props> = ({ state }) => {
  const scoring = calculateFinalScore(state);
  const appliedCombos = scoring.combos.filter(c => c.applied);
  const survived = state.turn >= state.maxTurns;

  // Calculate extraction rate (what % of original treasury you got)
  const initialTreasury = 1_000_000_000; // $1B starting
  const extractionRate = ((state.siphoned / initialTreasury) * 100).toFixed(1);

  const generateShareText = () => {
    const lines = [
      `🏦 Treasury Wars`,
      ``,
      survived ? `✅ Survived ${state.turn} turns` : `💀 Fell on turn ${state.turn}`,
      `💰 Extracted: ${formatScore(scoring.finalScore)}`,
      scoring.totalMultiplier > 1 ? `🎯 +${((scoring.totalMultiplier - 1) * 100).toFixed(0)}% combo bonus` : null,
      ``,
      `Play: treasury-game.vercel.app`
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      alert('Copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = generateShareText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* The Bag - Hero Number */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
        <div className="text-3xl mb-2">💰</div>
        <div className="text-[10px] uppercase tracking-wide text-emerald-400 mb-1">You Extracted</div>
        <div className="text-4xl font-bold text-emerald-300 tabular-nums">{formatScore(scoring.finalScore)}</div>
        {scoring.totalMultiplier > 1 && (
          <div className="text-sm text-amber-400 mt-2">
            +{((scoring.totalMultiplier - 1) * 100).toFixed(0)}% combo bonus applied
          </div>
        )}
        <div className="text-xs text-slate-500 mt-2">
          {extractionRate}% extraction rate
        </div>
      </div>

      {/* Combos Unlocked */}
      {appliedCombos.length > 0 && (
        <div className="game-card">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">Achievements Unlocked</div>
          <div className="space-y-2">
            {appliedCombos.map(({ combo }) => (
              <div key={combo.id} className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                <span className="text-xl">{combo.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-400">{combo.name}</div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">
                  +{((combo.multiplier - 1) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What you left behind */}
      <div className="game-card">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-3">The Aftermath</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Left Behind</div>
            <div className="text-sm font-bold text-slate-200">{formatMoney(state.officialTreasury)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Token</div>
            <div className={`text-sm font-bold ${state.tokenPrice < 0.5 ? "text-red-400" : state.tokenPrice > 1.2 ? "text-emerald-400" : "text-slate-200"}`}>
              {formatTokenPrice(state.tokenPrice)}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">TVL</div>
            <div className="text-sm font-bold text-slate-200">{formatMoney(state.tvl)}</div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2">
        <button onClick={handleShareTwitter} className="share-btn twitter flex-1 justify-center">
          <span>𝕏</span>
          <span>Share on X</span>
        </button>
        <button onClick={handleCopy} className="share-btn flex-1 justify-center">
          <span>📋</span>
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
};
