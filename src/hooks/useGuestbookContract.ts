import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { GUESTBOOK_CONTRACT_ADDRESS, GUESTBOOK_ABI } from '@/lib/contract';
import { toast } from 'sonner';

export interface BlockchainMessage {
  sender: string;
  content: string;
  timestamp: bigint;
  username: string;
  tag: string;
}

const isContractDeployed = GUESTBOOK_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

export function useGuestbookContract() {
  // Read all messages from the contract (only if deployed)
  const { data: messages, isLoading: isLoadingMessages, refetch: refetchMessages } = useReadContract({
    address: GUESTBOOK_CONTRACT_ADDRESS,
    abi: GUESTBOOK_ABI,
    functionName: 'getAllMessages',
    query: {
      enabled: isContractDeployed,
    },
  });

  // Read message count (only if deployed)
  const { data: messageCount } = useReadContract({
    address: GUESTBOOK_CONTRACT_ADDRESS,
    abi: GUESTBOOK_ABI,
    functionName: 'getMessageCount',
    query: {
      enabled: isContractDeployed,
    },
  });

  // Write contract hook
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Sign guestbook function
  const signGuestbook = async (content: string, username: string, tag: string) => {
    if (!isContractDeployed) {
      toast.error('Smart contract not deployed yet. Please deploy the contract first.');
      throw new Error('Contract not deployed');
    }

    try {
      return writeContract({
        address: GUESTBOOK_CONTRACT_ADDRESS,
        abi: GUESTBOOK_ABI,
        functionName: 'signGuestbook',
        args: [content, username, tag || ''],
      } as any);
    } catch (error) {
      console.error('Error signing guestbook:', error);
      toast.error('Failed to sign guestbook');
      throw error;
    }
  };

  return {
    messages: messages as BlockchainMessage[] | undefined,
    messageCount: messageCount as bigint | undefined,
    isLoadingMessages,
    signGuestbook,
    isWritePending,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
    refetchMessages,
    isContractDeployed,
  };
}
