import React from "react";

interface HowToPlayModalProps {
    open: boolean;
    onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content max-w-lg w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">wtf is this</h2>
                    <p className="text-slate-400 text-sm">a game about treasury management</p>
                </div>

                {/* Objective */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🎯 Goal</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        You run a crypto project. You have access to the treasury. <span className="text-emerald-400">Take what you can</span> before the community revolts, regulators arrive, or nobody believes you anymore. Survive 20 turns.
                    </p>
                </div>

                {/* Meters */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-3">📊 Meters</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                            <span className="text-2xl">😤</span>
                            <div>
                                <span className="text-rose-400 font-medium">Rage</span>
                                <p className="text-slate-400 text-xs">Community anger. At 100, they vote you out.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <span className="text-orange-400 font-medium">Heat</span>
                                <p className="text-slate-400 text-xs">Regulatory attention. At 100, assets frozen.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">✨</span>
                            <div>
                                <span className="text-purple-400 font-medium">Cred</span>
                                <p className="text-slate-400 text-xs">Your reputation. At 0, nobody listens.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">💎</span>
                            <div>
                                <span className="text-cyan-400 font-medium">Tech Hype</span>
                                <p className="text-slate-400 text-xs">Excitement about your product. Drives price.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Win/Lose */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🏆 Win / Lose</h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-emerald-400">✅ Survive 20 turns. Keep what you took.</p>
                        <p className="text-rose-400">❌ Rage hits 100 → coup</p>
                        <p className="text-rose-400">❌ Heat hits 100 → shutdown</p>
                        <p className="text-rose-400">❌ Cred hits 0 → ignored</p>
                        <p className="text-rose-400">❌ Treasury empty → game over</p>
                    </div>
                </div>

                {/* Pro Tips */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🧠 Tips</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li>• Don't siphon every turn. People notice.</li>
                        <li>• Defensive plays reduce random events by 70%.</li>
                        <li>• Seasons matter. Regulator Season is hard.</li>
                        <li>• Low rage + high cred = price goes up.</li>
                        <li>• Crises happen. Some options are less bad.</li>
                    </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
                    <p className="text-xs text-slate-500 text-center italic">
                        Satire. Don't do this in real life.
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors text-base"
                >
                    got it
                </button>
            </div>
        </div>
    );
};
