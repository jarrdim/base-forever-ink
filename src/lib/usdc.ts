import { Address, formatUnits, parseUnits } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// USDC contract addresses
export const USDC_ADDRESSES = {
  // Base mainnet
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
  // Base Sepolia testnet
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address,
} as const;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// ERC20 ABI for USDC operations
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Helper functions
export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, USDC_DECIMALS);
}

export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, USDC_DECIMALS);
}

export function getUSDCAddress(chainId: number): Address {
  return USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES] || USDC_ADDRESSES[84532];
}

// Hook to get USDC balance
export function useUSDCBalance(address: Address | undefined, chainId: number) {
  return useReadContract({
    address: getUSDCAddress(chainId),
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });
}

// Hook to get USDC allowance
export function useUSDCAllowance(
  owner: Address | undefined, 
  spender: Address | undefined, 
  chainId: number
) {
  return useReadContract({
    address: getUSDCAddress(chainId),
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!(owner && spender),
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  });
}

// Hook to approve USDC spending
export function useUSDCApprove(chainId: number) {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (spender: Address, amount: bigint) => {
    writeContract({
      address: getUSDCAddress(chainId),
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, amount],
    } as any);
  };

  return {
    approve,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Constants
export const SIGNING_FEE_USDC = parseUSDC('1'); // 1 USDC
export const SIGNING_FEE_DISPLAY = '1 USDC';