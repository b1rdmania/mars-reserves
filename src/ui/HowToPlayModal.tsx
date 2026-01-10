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
                <div className="text-center mb-5">
                    <div className="text-[9px] uppercase tracking-[0.15em] text-[#64748b] mb-1">Operations Manual</div>
                    <h2 className="text-base font-semibold uppercase tracking-wide text-[#c8cdd5]">Mission Briefing</h2>
                </div>

                {/* Objective */}
                <div className="mb-5">
                    <h3 className="text-[10px] uppercase tracking-[0.12em] text-[#d97706] mb-2">Objective</h3>
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                        You command humanity's first Mars colony. You have access to all resources. <span className="text-[#16a34a]">Build your legacy</span> before the crew revolts, Earth recalls you, or nobody believes in the mission anymore. Survive 20 cycles.
                    </p>
                </div>

                {/* Meters */}
                <div className="mb-5">
                    <h3 className="text-[10px] uppercase tracking-[0.12em] text-[#d97706] mb-3">Status Indicators</h3>
                    <div className="space-y-2 text-[11px]">
                        <div className="border border-[#1a1f28] p-2">
                            <span className="text-[#f87171] font-medium uppercase tracking-wide">Crew Unrest</span>
                            <p className="text-[#707d91] text-[10px] mt-0.5">Crew anger. At 100, they mutiny.</p>
                        </div>
                        <div className="border border-[#1a1f28] p-2">
                            <span className="text-[#fb923c] font-medium uppercase tracking-wide">Earth Oversight</span>
                            <p className="text-[#707d91] text-[10px] mt-0.5">Earth's attention. At 100, mission recalled.</p>
                        </div>
                        <div className="border border-[#1a1f28] p-2">
                            <span className="text-[#0891b2] font-medium uppercase tracking-wide">Command Trust</span>
                            <p className="text-[#707d91] text-[10px] mt-0.5">Your credibility. At 0, nobody follows orders.</p>
                        </div>
                        <div className="border border-[#1a1f28] p-2">
                            <span className="text-[#a78bfa] font-medium uppercase tracking-wide">Research Momentum</span>
                            <p className="text-[#707d91] text-[10px] mt-0.5">Excitement about discoveries. Drives mission value.</p>
                        </div>
                    </div>
                </div>

                <div className="mb-5">
                    <h3 className="text-[10px] uppercase tracking-[0.12em] text-[#d97706] mb-2">Victory</h3>
                    <p className="text-[#16a34a] text-[11px]">Survive 20 cycles. Maximize your Legacy Score.</p>
                </div>

                {/* Pro Tips */}
                <div className="mb-5">
                    <h3 className="text-[10px] uppercase tracking-[0.12em] text-[#d97706] mb-2">Commander Tips</h3>
                    <ul className="space-y-1.5 text-[11px] text-[#94a3b8]">
                        <li>• Don't extract every cycle. Crew notices.</li>
                        <li>• Crisis Response actions reduce random events by 70%.</li>
                        <li>• Seasons matter. Earth Oversight Season is brutal.</li>
                        <li>• Low unrest + high trust = mission value goes up.</li>
                        <li>• Crises happen. Some options are less catastrophic.</li>
                    </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-[#0a0c10] border border-[#1a1f28] p-2.5 mb-5">
                    <p className="text-[9px] text-[#64748b] text-center uppercase tracking-wide">
                        Science fiction satire. Not career advice.
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-[#0891b2] hover:bg-[#0e7490] text-white font-medium uppercase tracking-wider text-sm"
                >
                    Begin Mission
                </button>
            </div>
        </div>
    );
};
