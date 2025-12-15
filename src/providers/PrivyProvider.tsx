import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import type { ReactNode } from 'react';

// Movement Bardock testnet chain config
const movementBardock = {
    id: 336,
    name: 'Movement Bardock',
    network: 'movement-bardock',
    nativeCurrency: {
        decimals: 18,
        name: 'MOVE',
        symbol: 'MOVE',
    },
    rpcUrls: {
        default: {
            http: ['https://mevm.devnet.imola.movementlabs.xyz'],
        },
        public: {
            http: ['https://mevm.devnet.imola.movementlabs.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Movement Explorer',
            url: 'https://explorer.devnet.imola.movementlabs.xyz',
        },
    },
    testnet: true,
};

interface PrivyProviderProps {
    children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
    const appId = import.meta.env.VITE_PRIVY_APP_ID;

    if (!appId) {
        console.warn('VITE_PRIVY_APP_ID not set - Privy features disabled');
        return <>{children}</>;
    }

    return (
        <BasePrivyProvider
            appId={appId}
            config={{
                // Login methods
                loginMethods: ['email', 'google', 'twitter', 'discord'],

                // Appearance
                appearance: {
                    theme: 'dark',
                    accentColor: '#38bdf8', // sky-400
                    logo: undefined, // Can add Mars logo later
                },

                // Embedded wallets - configure per chain type
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },

                // Default chain
                defaultChain: movementBardock,
                supportedChains: [movementBardock],

                // Legal
                legal: {
                    termsAndConditionsUrl: undefined,
                    privacyPolicyUrl: undefined,
                },
            }}
        >
            {children}
        </BasePrivyProvider>
    );
}

// Export chain config for use elsewhere
export { movementBardock };
