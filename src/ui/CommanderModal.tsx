import React, { useState } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (commanderName: string) => void;
    defaultName?: string;
}

// Generate a random commander callsign
function generateCallsign(): string {
    const prefixes = ['CDR', 'CPT', 'LT', 'ENS', 'ADM'];
    const codes = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const nums = '0123456789';
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const code = codes[Math.floor(Math.random() * codes.length)] +
        codes[Math.floor(Math.random() * codes.length)];
    const num = nums[Math.floor(Math.random() * nums.length)] +
        nums[Math.floor(Math.random() * nums.length)];
    return `${prefix}-${code}${num}`;
}

export const CommanderModal: React.FC<Props> = ({ open, onClose, onSubmit, defaultName }) => {
    const [name, setName] = useState(defaultName || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        const finalName = name.trim() || generateCallsign();
        setIsSubmitting(true);
        try {
            await onSubmit(finalName);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateRandom = () => {
        setName(generateCallsign());
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="text-3xl mb-2">🚀</div>
                    <h2 className="text-xl font-bold">Welcome, Commander</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Set your callsign for the Colony Archive
                    </p>
                </div>

                {/* Name Input */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">
                            Commander Name
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter callsign..."
                                className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                                maxLength={24}
                                autoFocus
                            />
                            <button
                                onClick={handleGenerateRandom}
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                                title="Generate random callsign"
                            >
                                🎲
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            This will appear in the Colony Archive. Leave blank for auto-generated callsign.
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-slate-800/50 rounded-lg p-3 mt-4 border border-slate-700/50">
                    <div className="text-xs text-slate-400 space-y-1">
                        <div className="flex items-center gap-2">
                            <span>📊</span>
                            <span>Your missions will be recorded to the Archive</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🏆</span>
                            <span>Track your best score and mission count</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🔗</span>
                            <span>Same identity across all login methods</span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] py-3 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Confirm Identity'}
                    </button>
                </div>
            </div>
        </div>
    );
};
