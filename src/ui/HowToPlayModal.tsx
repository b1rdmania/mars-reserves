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
                    <p className="text-slate-400 text-sm">gm anon, here's the alpha</p>
                </div>

                {/* Objective */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🎯 The Objective</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        You're a crypto founder with access to the treasury. Your job? <span className="text-emerald-400">Secure the bag</span> before
                        the community notices, regulators arrive, or your credibility hits zero. Survive 20 turns and extract as much
                        value as humanly possible. This is not financial advice. This is survival.
                    </p>
                </div>

                {/* Meters */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-3">📊 The Meters (aka Your Life)</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                            <span className="text-2xl">😤</span>
                            <div>
                                <span className="text-rose-400 font-medium">Rage</span>
                                <p className="text-slate-400 text-xs">Community anger. Hit 100 and they coup you. Touch grass occasionally to prevent this.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <span className="text-orange-400 font-medium">Heat</span>
                                <p className="text-slate-400 text-xs">Regulatory attention. Hit 100 and Gary personally freezes your assets. Lawyer up or learn to code in prison.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">✨</span>
                            <div>
                                <span className="text-purple-400 font-medium">Cred</span>
                                <p className="text-slate-400 text-xs">Your reputation. Hit 0 and nobody believes a word you say. Even the bots unfollow.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">💎</span>
                            <div>
                                <span className="text-cyan-400 font-medium">Tech Hype</span>
                                <p className="text-slate-400 text-xs">How excited people are about your vaporware. Announce an AI pivot to pump this.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Win/Lose */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🏆 How to Win (or Lose)</h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-emerald-400">✅ Survive 20 turns with a fat personal wallet</p>
                        <p className="text-rose-400">❌ Rage ≥ 100 → DAO coup (they vote you out)</p>
                        <p className="text-rose-400">❌ Heat ≥ 100 → Regulatory shutdown (treasury frozen)</p>
                        <p className="text-rose-400">❌ Cred ≤ 0 → Nobody believes you (game over)</p>
                        <p className="text-rose-400">❌ Treasury empty → Nothing left to play with</p>
                    </div>
                </div>

                {/* Pro Tips */}
                <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wide text-amber-400 mb-2">🧠 Pro Tips from the Trenches</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li>• <span className="text-slate-400">Don't siphon every turn.</span> Even the most loyal community notices 50% APY going to "strategic advisors"</li>
                        <li>• <span className="text-slate-400">Defensive plays matter.</span> Lawyering up reduces random event chaos by 70%</li>
                        <li>• <span className="text-slate-400">Seasons change everything.</span> Meme Summer is easy mode. Regulator Season is not.</li>
                        <li>• <span className="text-slate-400">Price follows sentiment.</span> Keep rage low and cred high for number go up</li>
                        <li>• <span className="text-slate-400">Crises will happen.</span> Choose wisely. Some options are less terrible than others.</li>
                    </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
                    <p className="text-xs text-slate-500 text-center italic">
                        "DISCLAIMER: This is a satirical game about crypto governance. Do not actually do any of this.
                        We are not responsible for any rug pulls you may be inspired to commit. WAGMI (you won't)."
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors text-base"
                >
                    lfg 🚀
                </button>
            </div>
        </div>
    );
};
