'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

export function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clsm1p9E50000jF0F1Q2R3E4A'}
      config={{
        loginMethods: ['email'],
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
        {children}
    </PrivyProvider>
  );
}
