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
            <div className="flex items-center gap-2">
                <span className="text-[9px] px-1.5 py-0.5 bg-[#d97706]/20 text-[#d97706] uppercase tracking-wide font-medium">
                    GUEST
                </span>
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
