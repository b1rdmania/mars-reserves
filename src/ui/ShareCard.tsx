import React, { useRef } from "react";
import type { GameState } from "../engine/state";
import { formatMoney } from "./format";
import { calculateFinalScore, formatScore } from "../engine/scoring";
import type { EndingDef } from "../engine/endings";

interface Props {
  state: GameState;
  ending?: EndingDef;
  runHash?: string;
  indexDelta?: number;
  txHash?: string;
}

// Calculate index delta from score (same formula as contract)
function calculateIndexDelta(score: number): number {
  return Math.max(1, Math.floor(score / 1_000_000));
}

export const ShareCard: React.FC<Props> = ({ state, ending, runHash, indexDelta, txHash }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const scoring = calculateFinalScore(state);
  const endingMultiplier = ending?.scoreMultiplier ?? 1;
  const finalScore = scoring.finalScore * endingMultiplier;
  const initialReserves = 1_000_000_000;
  const extractionRate = ((state.legacy / initialReserves) * 100).toFixed(1);

  // Calculate or use provided index delta
  const delta = indexDelta ?? calculateIndexDelta(finalScore);

  const generateShareText = () => {
    const survived = state.turn >= state.maxTurns;
    const lines = [
      `🚀 Mars Extraction`,
      ``,
      ending ? `${ending.emoji} ${ending.headline}` : (survived ? `✅ Survived ${state.turn} cycles` : `💀 Fell on cycle ${state.turn}`),
      `🏛️ Legacy Score: ${formatScore(finalScore)}`,
      `📈 Index +${delta}`,
      ending?.badge ? `🏷️ ${ending.badge}` : null,
      runHash ? `#${runHash}` : null,
      ``,
      `Play: marsreserves.xyz`
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

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Use html2canvas if available, otherwise copy text
      const html2canvas = (window as unknown as { html2canvas?: (el: HTMLElement) => Promise<HTMLCanvasElement> }).html2canvas;
      if (html2canvas) {
        const canvas = await html2canvas(cardRef.current);
        const link = document.createElement('a');
        link.download = `mars-reserves-${runHash || 'run'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        // Fallback: copy text
        await handleCopy();
      }
    } catch {
      await handleCopy();
    }
  };

  const explorerUrl = txHash
    ? `https://explorer.movementnetwork.xyz/txn/${txHash}?network=bardock+testnet`
    : null;

  return (
    <div className="space-y-2">
      {/* Share Card Content */}
      <div ref={cardRef} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 border border-slate-700">
        {/* Score Display */}
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

        {/* Index Delta */}
        <div className="mt-2 flex items-center justify-center gap-2 text-center">
          <span className="text-sky-400 text-sm">📈</span>
          <span className="text-sky-300 font-semibold">Index +{delta}</span>
          {runHash && (
            <span className="text-slate-500 text-xs font-mono">#{runHash}</span>
          )}
        </div>

        {/* Aftermath Stats */}
        <div className="grid grid-cols-1 gap-1.5 text-center mt-2">
          <div className="bg-slate-800/50 rounded-lg p-2">
            <div className="text-[9px] text-slate-500 uppercase">Final Reserves</div>
            <div className="text-xs font-bold text-slate-200">{formatMoney(state.colonyReserves)}</div>
          </div>
        </div>

        {/* Explorer Link */}
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-center text-xs text-sky-400 hover:text-sky-300 underline"
          >
            View on Movement Explorer →
          </a>
        )}
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2">
        <button onClick={handleShareTwitter} className="share-btn twitter flex-1 justify-center py-2">
          <span>𝕏</span>
          <span className="text-xs">Share</span>
        </button>
        <button onClick={handleCopy} className="share-btn flex-1 justify-center py-2">
          <span>📋</span>
          <span className="text-xs">Copy</span>
        </button>
        <button onClick={handleDownload} className="share-btn flex-1 justify-center py-2">
          <span>📥</span>
          <span className="text-xs">Save</span>
        </button>
      </div>
    </div>
  );
};

