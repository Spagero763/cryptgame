'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clsm1p9E50000jF0F1Q2R3E4A'}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#673ab7',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
            createOnLogin: 'users-without-wallets'
        },
        defaultChain: baseSepolia
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
            {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
