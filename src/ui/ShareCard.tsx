import React from "react";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";
import { calculateFinalScore, formatScore } from "../engine/scoring";

interface Props {
  state: GameState;
}

export const ShareCard: React.FC<Props> = ({ state }) => {
  const reason = state.gameOverReason ?? "Run over";
  const scoring = calculateFinalScore(state);
  const appliedCombos = scoring.combos.filter(c => c.applied);

  const generateShareText = () => {
    const lines = [
      `🏦 Treasury Wars - Run Complete`,
      ``,
      `💰 Siphoned: ${formatScore(scoring.finalScore)}`,
      scoring.totalMultiplier > 1 ? `🎯 Combo Bonus: ${((scoring.totalMultiplier - 1) * 100).toFixed(0)}%` : null,
      ``,
      `${reason}`,
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
    <div className="mt-4 space-y-4">
      {/* Final Score - BIG */}
      <div className="text-center py-4">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Final Score</div>
        <div className="text-4xl font-bold text-emerald-400">{formatScore(scoring.finalScore)}</div>
        {scoring.totalMultiplier > 1 && (
          <div className="text-sm text-amber-400 mt-1">
            +{((scoring.totalMultiplier - 1) * 100).toFixed(0)}% combo bonus
          </div>
        )}
      </div>

      {/* Combos Unlocked */}
      {appliedCombos.length > 0 && (
        <div className="game-card">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">Combos Unlocked</div>
          <div className="space-y-2">
            {appliedCombos.map(({ combo }) => (
              <div key={combo.id} className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                <span className="text-xl">{combo.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-400">{combo.name}</div>
                  <div className="text-[10px] text-slate-400">{combo.description}</div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">
                  +{((combo.multiplier - 1) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="game-card">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-3">Run Stats</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Raw Siphoned</div>
            <div className="text-lg font-bold text-slate-200">{formatMoney(state.siphoned)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Treasury Left</div>
            <div className="text-lg font-bold text-slate-200">{formatMoney(state.officialTreasury)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Token Price</div>
            <div className="text-lg font-bold">{formatTokenPrice(state.tokenPrice)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">TVL</div>
            <div className="text-lg font-bold">{formatMoney(state.tvl)}</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="text-sm text-amber-300">{reason}</div>
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
