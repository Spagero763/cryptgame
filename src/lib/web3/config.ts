'use client';

import { http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { createConfig } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});
