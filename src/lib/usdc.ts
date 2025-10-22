import { Address, formatUnits, parseUnits } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// USDC contract addresses
export const USDC_ADDRESSES = {
  // Base mainnet
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
  // Base Sepolia testnet - Official Circle USDC
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address,
} as const;

// Alternative USDC addresses for Base Sepolia (for testing different faucets)
export const ALTERNATIVE_USDC_ADDRESSES = {
  84532: [
    '0x6Ac3aB54Dc5019A2e57eCcb214337FF5bbD52897' as Address, // RWA Inc testnet USDC
    '0xe7C72e6AE112654D3b4903ba7fd1214b2901A189' as Address, // User's received token address
  ]
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

// Hook to check multiple USDC addresses and find the one with balance
export function useMultiUSDCBalance(address: Address | undefined, chainId: number) {
  const primaryAddress = getUSDCAddress(chainId);
  const alternativeAddresses = ALTERNATIVE_USDC_ADDRESSES[chainId as keyof typeof ALTERNATIVE_USDC_ADDRESSES] || [];
  
  console.log('useMultiUSDCBalance Debug:', {
    address,
    chainId,
    primaryAddress,
    alternativeAddresses,
    ALTERNATIVE_USDC_ADDRESSES
  });
  
  // Check primary address
  const primaryBalance = useReadContract({
    address: primaryAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 3000,
      staleTime: 0,
      gcTime: 0,
    }
  });

  // Check alternative addresses (fixed number to avoid Rules of Hooks violation)
  const alt1Balance = useReadContract({
    address: alternativeAddresses[0],
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!alternativeAddresses[0],
      refetchInterval: 3000,
      staleTime: 0,
      gcTime: 0,
    }
  });

  const alt2Balance = useReadContract({
    address: alternativeAddresses[1],
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!alternativeAddresses[1],
      refetchInterval: 3000,
      staleTime: 0,
      gcTime: 0,
    }
  });

  const alternativeBalances = [alt1Balance, alt2Balance].filter((_, index) => !!alternativeAddresses[index]);

  // Find the address with the highest balance
  const allResults = [
    { address: primaryAddress, ...primaryBalance },
    ...alternativeBalances.map((balance, index) => ({
      address: alternativeAddresses[index],
      ...balance
    }))
  ];

  const bestResult = allResults.reduce((best, current) => {
    const currentBalance = current.data || 0n;
    const bestBalance = best.data || 0n;
    return currentBalance > bestBalance ? current : best;
  }, allResults[0]);

  console.log('Multi USDC Balance Check:', {
    address,
    chainId,
    primaryAddress,
    alternativeAddresses,
    allResults: allResults.map(r => ({
      address: r.address,
      balance: r.data?.toString(),
      formatted: r.data ? formatUSDC(r.data) : '0',
      isLoading: r.isLoading,
      error: r.error?.message
    })),
    bestResult: {
      address: bestResult.address,
      balance: bestResult.data?.toString(),
      formatted: bestResult.data ? formatUSDC(bestResult.data) : '0'
    }
  });

  return {
    data: bestResult.data,
    refetch: () => {
      primaryBalance.refetch();
      if (alternativeAddresses[0]) alt1Balance.refetch();
      if (alternativeAddresses[1]) alt2Balance.refetch();
    },
    usdcAddress: bestResult.address,
    isLoading: allResults.some(r => r.isLoading),
    error: allResults.find(r => r.error)?.error
  };
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
      refetchInterval: 3000, // Refetch every 3 seconds
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache data
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
      refetchInterval: 3000, // Refetch every 3 seconds
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache data
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