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
                    <h2 className="text-2xl font-bold mb-2">Mission Briefing</h2>
                    <p className="text-slate-400 text-sm">a game about colony management</p>
                </div>

                {/* Objective */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🎯 Objective</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        You command humanity's first Mars colony. You have access to all resources. <span className="text-emerald-400">Build your legacy</span> before the crew revolts, Earth recalls you, or nobody believes in the mission anymore. Survive 20 cycles.
                    </p>
                </div>

                {/* Meters */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-3">📊 Status Indicators</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                            <span className="text-2xl">😤</span>
                            <div>
                                <span className="text-rose-400 font-medium">Crew Unrest</span>
                                <p className="text-slate-400 text-xs">Crew anger. At 100, they mutiny.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <span className="text-orange-400 font-medium">Earth Oversight</span>
                                <p className="text-slate-400 text-xs">Earth's attention. At 100, mission recalled.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">✨</span>
                            <div>
                                <span className="text-purple-400 font-medium">Command Trust</span>
                                <p className="text-slate-400 text-xs">Your credibility. At 0, nobody follows orders.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">💎</span>
                            <div>
                                <span className="text-cyan-400 font-medium">Research Momentum</span>
                                <p className="text-slate-400 text-xs">Excitement about discoveries. Drives mission value.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🏆 Victory</h3>
                    <p className="text-emerald-400 text-sm">✅ Survive 20 cycles. Maximize your Legacy Score.</p>
                </div>

                {/* Pro Tips */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🧠 Commander Tips</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li>• Don't extract every cycle. Crew notices.</li>
                        <li>• Crisis Response actions reduce random events by 70%.</li>
                        <li>• Seasons matter. Earth Oversight Season is brutal.</li>
                        <li>• Low unrest + high trust = mission value goes up.</li>
                        <li>• Crises happen. Some options are less catastrophic.</li>
                    </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
                    <p className="text-xs text-slate-500 text-center italic">
                        Science fiction satire. Not career advice.
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors text-base"
                >
                    Begin Mission
                </button>
            </div>
        </div>
    );
};
