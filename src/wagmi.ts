import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Base Forever Book',
  projectId: '9bf0183349252b3da5a51e76f76d6761', // Get this from https://cloud.walletconnect.com/
  chains: [base, baseSepolia],
  ssr: false,
});