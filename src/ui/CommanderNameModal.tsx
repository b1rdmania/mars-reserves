import React, { useState, useEffect } from 'react';
import { useGameSession, deriveCommanderId } from '../hooks/useGameSession';
import { usePrivy } from '@privy-io/react-auth';

interface Props {
    open: boolean;
    onClose: () => void;
}

// Generate random commander name suggestions
const PREFIXES = ['', 'von ', 'de ', 'O\'', 'Mc'];
const SURNAMES = [
    'Petrov', 'Chen', 'Vasquez', 'Nakamura', 'Okonkwo', 'Mueller', 'Santos',
    'Johansson', 'Kim', 'Patel', 'Rodriguez', 'Thompson', 'Wright', 'Zhang',
    'Singh', 'Garcia', 'Hoffman', 'Tanaka', 'Rossi', 'Laurent', 'Andersen'
];

function generateSuggestion(): string {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    return `${prefix}${surname}`;
}

export const CommanderNameModal: React.FC<Props> = ({ open, onClose }) => {
    const { user } = usePrivy();
    const { setCommanderName } = useGameSession();
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const commanderId = user?.wallet?.address
        ? deriveCommanderId(user.wallet.address)
        : 'CMD. X-000';

    // Generate initial suggestion
    useEffect(() => {
        if (open && !name) {
            setName(generateSuggestion());
        }
    }, [open, name]);

    if (!open) return null;

    const handleRegenerate = () => {
        setName(generateSuggestion());
    };

    const handleConfirm = async () => {
        if (!name.trim()) {
            setError('Please enter a call sign');
            return;
        }

        if (name.trim().length < 2) {
            setError('Call sign must be at least 2 characters');
            return;
        }

        if (name.trim().length > 30) {
            setError('Call sign must be 30 characters or less');
            return;
        }

        setSaving(true);
        setError(null);

        const success = await setCommanderName(name.trim());

        if (success) {
            onClose();
        } else {
            setError('Failed to save. Please try again.');
        }

        setSaving(false);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content max-w-sm w-full">
                {/* Header */}
                <div className="text-center mb-5">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-[#64748b] mb-2">
                        New Commander
                    </div>
                    <h2 className="text-base font-semibold uppercase tracking-wide text-[#c8cdd5]">
                        Choose Your Call Sign
                    </h2>
                    <p className="text-[10px] text-[#707d91] mt-1">
                        This is how you'll be remembered in the Archive.
                    </p>
                </div>

                {/* Commander ID Preview */}
                <div className="bg-[#0a0c10] border border-[#1a1f28] p-3 mb-4 text-center">
                    <div className="text-[8px] uppercase tracking-[0.1em] text-[#64748b] mb-1">
                        Commander ID
                    </div>
                    <div className="text-sm font-mono text-[#0891b2]">
                        {commanderId}
                    </div>
                </div>

                {/* Name Input */}
                <div className="mb-4">
                    <label className="block">
                        <span className="text-[9px] uppercase tracking-[0.12em] text-[#64748b]">
                            Call Sign
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 bg-[#0a0c10] border border-[#1a1f28] px-3 py-2.5 text-sm focus:outline-none focus:border-[#0891b2] font-mono"
                            placeholder="Enter call sign"
                            maxLength={30}
                            autoFocus
                        />
                    </label>
                    <button
                        onClick={handleRegenerate}
                        className="mt-2 text-[9px] text-[#64748b] hover:text-[#0891b2] uppercase tracking-wide"
                    >
                        ↻ Regenerate
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="border border-[#dc2626] bg-[#dc2626]/5 p-2.5 text-center mb-4">
                        <div className="text-[11px] text-[#f87171]">{error}</div>
                    </div>
                )}

                {/* Preview */}
                <div className="bg-[#0a0c10] border border-[#1a1f28] p-3 mb-4 text-center">
                    <div className="text-[8px] uppercase tracking-[0.1em] text-[#64748b] mb-1">
                        Archive Preview
                    </div>
                    <div className="text-sm font-semibold text-[#c8cdd5] uppercase">
                        CMDR. {name.toUpperCase() || '—'}
                    </div>
                    <div className="text-[9px] text-[#707d91] font-mono mt-0.5">
                        {commanderId}
                    </div>
                </div>

                {/* Actions */}
                <button
                    onClick={handleConfirm}
                    disabled={saving || !name.trim()}
                    className="w-full py-3 px-4 bg-[#0891b2] hover:bg-[#0e7490] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium uppercase tracking-wider text-sm"
                >
                    {saving ? 'Saving...' : 'Confirm Call Sign'}
                </button>
            </div>
        </div>
    );
};
