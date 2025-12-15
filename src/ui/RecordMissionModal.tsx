import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { GameState } from '../engine/state';
import type { EndingDef } from '../engine/endings';
import { calculateFinalScore, formatScore } from '../engine/scoring';

interface RecordMissionModalProps {
    open: boolean;
    onClose: () => void;
    state: GameState;
    ending?: EndingDef;
    seed: number;
    actionIds: string[];
}

export const RecordMissionModal: React.FC<RecordMissionModalProps> = ({
    open,
    onClose,
    state,
    ending,
    seed,
    actionIds,
}) => {
    const { ready, authenticated, login, user } = usePrivy();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const scoring = calculateFinalScore(state);
    const endingMultiplier = ending?.scoreMultiplier ?? 1;
    const finalScore = Math.floor(scoring.finalScore * endingMultiplier);

    const handleConnect = async () => {
        try {
            await login();
        } catch (err) {
            console.error('Login failed:', err);
            setError('Failed to connect. Please try again.');
        }
    };

    const handleSubmit = async () => {
        if (!user?.wallet?.address) {
            setError('No wallet connected');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // TODO: Call verification endpoint
            const response = await fetch('/api/submit-run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seed,
                    actionIds,
                    score: finalScore,
                    endingId: ending?.id ?? 'unknown',
                    wallet: user.wallet.address,
                    // TODO: Add signature
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Verification failed');
            }

            const result = await response.json();
            setTxHash(result.txHash);
            setSubmitted(true);
        } catch (err) {
            console.error('Submit failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to record mission');
        } finally {
            setSubmitting(false);
        }
    };

    const walletAddress = user?.wallet?.address;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <span className="text-4xl mb-2 block">🚀</span>
                    <h2 className="text-xl font-bold">Record Mission</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Save your run to the Colony Index
                    </p>
                </div>

                {/* Score Summary */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4 text-center">
                    <div className="text-xs uppercase tracking-wide text-emerald-400 mb-1">
                        Legacy Score
                    </div>
                    <div className="text-3xl font-bold text-emerald-300">
                        {formatScore(finalScore)}
                    </div>
                    {ending && (
                        <div className="text-sm text-slate-400 mt-2">
                            {ending.emoji} {ending.headline}
                        </div>
                    )}
                </div>

                {/* Connection State */}
                {!ready ? (
                    <div className="text-center py-4">
                        <div className="text-slate-400 text-sm">Loading...</div>
                    </div>
                ) : submitted ? (
                    /* Success State */
                    <div className="space-y-4">
                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-4 text-center">
                            <span className="text-2xl">✅</span>
                            <div className="text-emerald-300 font-semibold mt-2">
                                Mission Recorded!
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Your run has been verified and saved.
                            </p>
                        </div>
                        {txHash && (
                            <a
                                href={`https://explorer.devnet.imola.movementlabs.xyz/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-center text-sm text-sky-400 font-medium rounded-xl transition-colors"
                            >
                                View on Explorer →
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : !authenticated ? (
                    /* Connect State */
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400 text-center">
                            Connect to save your run to the leaderboard and record it on-chain.
                        </p>
                        <button
                            onClick={handleConnect}
                            className="w-full py-4 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors"
                        >
                            Connect Wallet
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors text-sm"
                        >
                            Maybe Later
                        </button>
                    </div>
                ) : (
                    /* Submit State */
                    <div className="space-y-4">
                        {walletAddress && (
                            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                                <div className="text-xs text-slate-500 uppercase tracking-wide">
                                    Connected as
                                </div>
                                <div className="text-sm text-slate-300 font-mono mt-1">
                                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-center">
                                <div className="text-sm text-red-300">{error}</div>
                            </div>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                        >
                            {submitting ? 'Recording...' : 'Record Mission'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium rounded-xl transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
