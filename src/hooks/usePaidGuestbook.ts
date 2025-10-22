import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { PAID_GUESTBOOK_CONTRACT_ADDRESS, PAID_GUESTBOOK_ABI, USDC_TOKEN_ADDRESS, ERC20_ABI, SIGNING_FEE_USDC } from '@/lib/paid-guestbook-contract';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export interface PaidMessage {
  sender: string;
  content: string;
  timestamp: bigint;
  username: string;
  tag: string;
}

const isContractDeployed = PAID_GUESTBOOK_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

export function usePaidGuestbook() {
  const { address } = useAccount();
  const [needsApproval, setNeedsApproval] = useState(false);

  // Read USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isContractDeployed,
    },
  });

  // Read USDC allowance
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, PAID_GUESTBOOK_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address && isContractDeployed,
    },
  });

  // Read message count
  const { data: messageCount, refetch: refetchMessageCount } = useReadContract({
    address: PAID_GUESTBOOK_CONTRACT_ADDRESS,
    abi: PAID_GUESTBOOK_ABI,
    functionName: 'getMessageCount',
    query: {
      enabled: isContractDeployed,
    },
  });

  // Read all messages
  const { data: allMessages, refetch: refetchMessages, isLoading: isLoadingMessages } = useReadContract({
    address: PAID_GUESTBOOK_CONTRACT_ADDRESS,
    abi: PAID_GUESTBOOK_ABI,
    functionName: 'getAllMessages',
    query: {
      enabled: isContractDeployed,
    },
  });

  // Check if approval is needed
  useEffect(() => {
    if (usdcAllowance !== undefined && usdcAllowance < SIGNING_FEE_USDC) {
      setNeedsApproval(true);
    } else {
      setNeedsApproval(false);
    }
  }, [usdcAllowance]);

  // Write contract hooks
  const { 
    writeContract: writeApprove, 
    data: approveHash, 
    isPending: isApprovePending 
  } = useWriteContract();

  const { 
    writeContract: writeSign, 
    data: signHash, 
    isPending: isSignPending 
  } = useWriteContract();

  // Wait for approve transaction
  const { 
    isLoading: isApproveConfirming, 
    isSuccess: isApproveConfirmed 
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for sign transaction
  const { 
    isLoading: isSignConfirming, 
    isSuccess: isSignConfirmed 
  } = useWaitForTransactionReceipt({
    hash: signHash,
  });

  // Approve USDC spending
  const approveUSDC = async () => {
    if (!isContractDeployed) {
      toast.error('Contract not deployed yet');
      throw new Error('Contract not deployed');
    }

    try {
      return writeApprove({
        address: USDC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PAID_GUESTBOOK_CONTRACT_ADDRESS, SIGNING_FEE_USDC * 100n], // Approve 100 signatures worth
      } as any);
    } catch (error) {
      console.error('Error approving USDC:', error);
      toast.error('Failed to approve USDC');
      throw error;
    }
  };

  // Sign guestbook with USDC payment
  const signGuestbook = async (content: string, username: string, tag: string) => {
    if (!isContractDeployed) {
      toast.error('Smart contract not deployed yet');
      throw new Error('Contract not deployed');
    }

    if (needsApproval) {
      toast.error('Please approve USDC spending first');
      throw new Error('USDC approval required');
    }

    try {
      return writeSign({
        address: PAID_GUESTBOOK_CONTRACT_ADDRESS,
        abi: PAID_GUESTBOOK_ABI,
        functionName: 'signGuestbook',
        args: [content, username, tag || ''],
      } as any);
    } catch (error) {
      console.error('Error signing guestbook:', error);
      toast.error('Failed to sign guestbook');
      throw error;
    }
  };

  // Parse messages from contract
  const messages: PaidMessage[] = allMessages ? allMessages.map((msg: any) => ({
    sender: msg.sender,
    content: msg.content,
    timestamp: msg.timestamp,
    username: msg.username,
    tag: msg.tag,
  })) : [];

  return {
    // Message data
    messages,
    messageCount: messageCount as bigint | undefined,
    isLoadingMessages,
    
    // USDC data
    usdcBalance: usdcBalance as bigint | undefined,
    usdcAllowance: usdcAllowance as bigint | undefined,
    needsApproval,
    signingFee: SIGNING_FEE_USDC,
    
    // Actions
    signGuestbook,
    approveUSDC,
    
    // Transaction states
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveHash,
    
    isSignPending,
    isSignConfirming,
    isSignConfirmed,
    signHash,
    
    // Refetch functions
    refetchMessages,
    refetchBalance,
    refetchAllowance,
    
    // Contract status
    isContractDeployed,
  };
}
