import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'viem';

// Custom Base Sepolia chain with proper RPC configuration
const baseSepoliaWithPaymaster = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
} as const;

// Custom Base mainnet chain with proper RPC configuration
const baseWithPaymaster = {
  ...base,
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Base Forever Book',
  projectId: '9bf0183349252b3da5a51e76f76d6761',
  chains: [baseSepoliaWithPaymaster as any, baseWithPaymaster as any],
  ssr: false,
});