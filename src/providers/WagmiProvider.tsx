'use client';

import { WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import { http } from 'viem';
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

// Create a client
const queryClient = new QueryClient();

const projectId = 'fff8f9f218f93d91d162cc2de8343333';
const appName = 'DSKDAO Item Shop';

// Create wagmi config outside of the component to prevent multiple initializations
const { wallets } = getDefaultWallets();
const connectors = connectorsForWallets(wallets, {
  appName,
  projectId,
});

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors,
});

export default function WagmiProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#0075FF',
            borderRadius: 'medium',
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
} 