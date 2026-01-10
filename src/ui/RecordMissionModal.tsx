import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { GameState } from '../engine/state';
import type { EndingDef } from '../engine/endings';
import { calculateFinalScore, formatScore } from '../engine/scoring';
import { useGameSession } from '../hooks/useGameSession';

interface RecordMissionModalProps {
    open: boolean;
    onClose: () => void;
    onBackToHome?: () => void;
    state: GameState;
    ending?: EndingDef;
    seed: number;
    actionIds: string[];
}

export const RecordMissionModal: React.FC<RecordMissionModalProps> = ({
    open,
    onClose,
    onBackToHome,
    state,
    ending,
    seed,
    actionIds,
}) => {
    const { ready, authenticated, login, user } = usePrivy();
    const { profile, refreshProfile } = useGameSession();
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
            const response = await fetch('/api/submit-run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seed,
                    actionIds,
                    score: finalScore,
                    endingId: ending?.id ?? 'unknown',
                    wallet: user.wallet.address,
                    privyUserId: user.id,
                    commanderName: profile?.commander_name || 'Unknown Commander',
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Verification failed');
            }

            const result = await response.json();
            console.log('[RecordMission] API Response:', result);
            setTxHash(result.onChain?.txHash || null);

            // If on-chain failed but run was saved, show the specific on-chain error
            if (!result.onChain?.txHash && result.onChain?.error) {
                setError(result.onChain.error);
            }

            setSubmitted(true);
            // Refresh profile to update career stats
            await refreshProfile();
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
                <div className="text-center mb-5">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#4a5565] mb-2">Mission Archive</div>
                    <h2 className="text-base font-semibold uppercase tracking-wide text-[#c8cdd5]">File Official Report</h2>
                    <p className="text-[10px] text-[#5a6475] mt-1">
                        Record this mission permanently.
                    </p>
                </div>

                {/* Score Summary */}
                <div className="border-l-2 border-l-[#16a34a] bg-[#0a0c10] p-3 mb-4 text-center">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-[#4a5565] mb-1">
                        Legacy Score
                    </div>
                    <div className="text-xl font-semibold text-[#16a34a] font-mono">
                        {formatScore(finalScore)}
                    </div>
                    {ending && (
                        <div className="text-[10px] text-[#5a6475] mt-1">
                            {ending.headline}
                        </div>
                    )}
                </div>

                {/* Connection State */}
                {!ready ? (
                    <div className="text-center py-4">
                        <div className="text-[#4a5565] text-[10px] uppercase tracking-wide">Loading...</div>
                    </div>
                ) : submitted ? (
                    /* Success State */
                    <div className="space-y-3">
                        <div className="border border-[#16a34a] bg-[#16a34a]/5 p-3 text-center">
                            <div className="text-[#16a34a] font-medium text-sm uppercase tracking-wide">
                                Recorded to Archive
                            </div>
                            <p className="text-[10px] text-[#5a6475] mt-1">
                                Your mission has been verified and saved.
                            </p>
                        </div>
                        {txHash ? (
                            <a
                                href={`https://explorer.movementnetwork.xyz/txn/${txHash}?network=bardock+testnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-4 bg-[#0891b2] hover:bg-[#0e7490] text-center text-sm text-white font-semibold uppercase tracking-wide"
                            >
                                View on Blockchain →
                            </a>
                        ) : error ? (
                            <div className="border border-[#ea580c] bg-[#ea580c]/5 p-3 text-center">
                                <div className="text-[#ea580c] font-medium text-[10px] uppercase tracking-wide">
                                    Archive Proof Bypassed
                                </div>
                                <p className="text-[9px] text-[#5a6475] mt-1">
                                    Reason: {error}
                                </p>
                            </div>
                        ) : null}
                        {onBackToHome ? (
                            <button
                                onClick={onBackToHome}
                                className="w-full py-2.5 px-4 bg-[#0d0f13] hover:bg-[#12151c] text-[#8b95a5] font-medium border border-[#1a1f28] text-sm uppercase tracking-wide"
                            >
                                Back to Home
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 px-4 bg-[#0d0f13] hover:bg-[#12151c] text-[#8b95a5] font-medium border border-[#1a1f28] text-sm"
                            >
                                Close
                            </button>
                        )}
                    </div>
                ) : !authenticated ? (
                    /* Connect State */
                    <div className="space-y-3">
                        <p className="text-[10px] text-[#5a6475] text-center">
                            Sign in to file your mission report and record it permanently.
                        </p>
                        <button
                            onClick={handleConnect}
                            className="w-full py-3 px-4 bg-[#0891b2] hover:bg-[#0e7490] text-white font-medium uppercase tracking-wider text-sm"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 bg-[#0d0f13] hover:bg-[#12151c] text-[#5a6475] font-medium border border-[#1a1f28] text-xs"
                        >
                            Maybe Later
                        </button>
                    </div>
                ) : (
                    /* Submit State */
                    <div className="space-y-3">
                        {walletAddress && (
                            <div className="bg-[#0a0c10] border border-[#1a1f28] p-2.5 text-center">
                                <div className="text-[8px] text-[#4a5565] uppercase tracking-[0.12em]">
                                    Connected as
                                </div>
                                <div className="text-[11px] text-[#8b95a5] font-mono mt-0.5">
                                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="border border-[#dc2626] bg-[#dc2626]/5 p-2.5 text-center">
                                <div className="text-[11px] text-[#f87171]">{error}</div>
                            </div>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-3 px-4 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium uppercase tracking-wider text-sm"
                        >
                            {submitting ? 'Recording...' : 'Record Mission'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={submitting}
                            className="w-full py-2.5 px-4 bg-[#0d0f13] hover:bg-[#12151c] disabled:opacity-50 text-[#5a6475] font-medium border border-[#1a1f28] text-xs"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
