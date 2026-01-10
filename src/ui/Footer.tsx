import React from 'react';

export const Footer: React.FC<{ className?: string }> = ({ className = "" }) => {
    return (
        <footer className={`flex flex-col items-center gap-2 py-6 border-t border-[#1a1f28] mt-auto ${className}`}>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#64748b]">
                <a
                    href="https://github.com/b1rdmania/mars-reserves"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0891b2] transition-colors"
                >
                    Source Code
                </a>
                <span className="opacity-30">|</span>
                <a
                    href="https://x.com/b1rdmania"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0891b2] transition-colors"
                >
                    Created by b1rdmania
                </a>
            </div>
        </footer>
    );
};
