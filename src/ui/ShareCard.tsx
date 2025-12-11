import React from "react";
import type { GameState } from "../engine/state";
import { formatMoney, formatTokenPrice } from "./format";

interface Props {
  state: GameState;
}

export const ShareCard: React.FC<Props> = ({ state }) => {
  const reason = state.gameOverReason ?? "Run over";

  const generateShareText = () => {
    const lines = [
      `🏦 Treasury Wars - Run Complete`,
      ``,
      `💰 Siphoned: ${formatMoney(state.siphoned)}`,
      `🏛️ Treasury: ${formatMoney(state.officialTreasury)}`,
      `📊 Turn ${state.turn}/${state.maxTurns}`,
      ``,
      `${reason}`,
      ``,
      `Play: treasury-game.vercel.app`
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      alert('Copied to clipboard!');
    } catch {
      // Fallback for older browsers
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
      {/* Stats Summary */}
      <div className="game-card">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-3">Run Summary</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Siphoned</div>
            <div className="text-xl font-bold text-emerald-400">{formatMoney(state.siphoned)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Treasury</div>
            <div className="text-xl font-bold text-slate-200">{formatMoney(state.officialTreasury)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">Price</div>
            <div className="text-xl font-bold">{formatTokenPrice(state.tokenPrice)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 uppercase">TVL</div>
            <div className="text-xl font-bold">{formatMoney(state.tvl)}</div>
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
