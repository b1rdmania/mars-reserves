import React from "react";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";
import { calculateFinalScore, formatScore } from "../engine/scoring";
import type { EndingDef } from "../engine/endings";

interface Props {
  state: GameState;
  ending?: EndingDef;
}

export const ShareCard: React.FC<Props> = ({ state, ending }) => {
  const scoring = calculateFinalScore(state);
  const endingMultiplier = ending?.scoreMultiplier ?? 1;
  const finalScore = scoring.finalScore * endingMultiplier;
  const initialReserves = 1_000_000_000;
  const extractionRate = ((state.siphoned / initialReserves) * 100).toFixed(1);

  const generateShareText = () => {
    const survived = state.turn >= state.maxTurns;
    const lines = [
      `🚀 Move: Mars Reserves`,
      ``,
      ending ? `${ending.emoji} ${ending.headline}` : (survived ? `✅ Survived ${state.turn} cycles` : `💀 Fell on cycle ${state.turn}`),
      `🏛️ Legacy Score: ${formatScore(finalScore)}`,
      ending?.badge ? `🏷️ ${ending.badge}` : null,
      ``,
      `Play: mars-reserves.vercel.app`
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      alert('Copied!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = generateShareText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied!');
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-2">
      {/* Compact Score Display */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🏛️</span>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-emerald-400">Legacy Score</div>
            <div className="text-2xl font-bold text-emerald-300 tabular-nums">{formatScore(finalScore)}</div>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          {extractionRate}% of reserves
          {(scoring.totalMultiplier > 1 || endingMultiplier > 1) && (
            <span className="text-amber-400 ml-2">
              {scoring.totalMultiplier > 1 && `+${((scoring.totalMultiplier - 1) * 100).toFixed(0)}%`}
              {endingMultiplier > 1 && ` +${((endingMultiplier - 1) * 100).toFixed(0)}% ending`}
            </span>
          )}
        </div>
      </div>

      {/* Compact Aftermath - inline */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-[9px] text-slate-500 uppercase">Reserves</div>
          <div className="text-xs font-bold text-slate-200">{formatMoney(state.officialTreasury)}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-[9px] text-slate-500 uppercase">Value</div>
          <div className={`text-xs font-bold ${state.tokenPrice < 0.5 ? "text-red-400" : state.tokenPrice > 1.2 ? "text-emerald-400" : "text-slate-200"}`}>
            {formatTokenPrice(state.tokenPrice)}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-[9px] text-slate-500 uppercase">Infra</div>
          <div className="text-xs font-bold text-slate-200">{formatMoney(state.tvl)}</div>
        </div>
      </div>

      {/* Compact Share Buttons */}
      <div className="flex gap-2">
        <button onClick={handleShareTwitter} className="share-btn twitter flex-1 justify-center py-2">
          <span>𝕏</span>
          <span className="text-xs">Share</span>
        </button>
        <button onClick={handleCopy} className="share-btn flex-1 justify-center py-2">
          <span>📋</span>
          <span className="text-xs">Copy</span>
        </button>
      </div>
    </div>
  );
};
