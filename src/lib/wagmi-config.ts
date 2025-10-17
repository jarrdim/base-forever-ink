import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'viem';

// Custom Base chain with Coinbase Gasless Paymaster RPC
const baseWithPaymaster = {
  ...base,
  rpcUrls: {
    default: {
      http: ['https://api.developer.coinbase.com/rpc/v1/base/8WcOWUNTUdDgfM81Z70A9OnqOFa1sUzW'],
    },
    public: {
      http: ['https://api.developer.coinbase.com/rpc/v1/base/8WcOWUNTUdDgfM81Z70A9OnqOFa1sUzW'],
    },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Base Forever Book',
  projectId: '9bf0183349252b3da5a51e76f76d6761',
  chains: [baseWithPaymaster as any, baseSepolia],
  ssr: false,
});