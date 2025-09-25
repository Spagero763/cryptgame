'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/web3/config';

const queryClient = new QueryClient();

export function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
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
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
