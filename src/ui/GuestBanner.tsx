import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface Props {
    className?: string;
}

export const GuestBanner: React.FC<Props> = ({ className = '' }) => {
    const { login } = usePrivy();

    const handleSignIn = async () => {
        try {
            await login();
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    return (
        <div className={`bg-[#0a0c10] border border-[#1a1f28] px-3 py-2 flex items-center justify-between ${className}`}>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 opacity-80">
                    <span className="text-[8px] uppercase tracking-tighter text-[#5a6475]">Protected by</span>
                    <img src="/PRivy_ProtectedLockup_White.svg" alt="Privy" className="h-4 w-auto" />
                </div>
                <span className="text-[10px] text-[#5a6475]">
                    Sign in to claim a commander name and track your record.
                </span>
            </div>
            <button
                onClick={handleSignIn}
                className="text-[9px] text-[#0891b2] hover:text-[#38bdf8] uppercase tracking-wide font-medium"
            >
                SIGN IN
            </button>
        </div>
    );
};
