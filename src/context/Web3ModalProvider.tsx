'use client'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'ed4e0bdab7fa4cab75a28255604592df'

// 2. Create wagmiConfig
const metadata = {
  name: 'VersaGames',
  description: 'A collection of classic games with a web3 twist.',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [baseSepolia] as const
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: true, 
  enableOnramp: true 
})

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
