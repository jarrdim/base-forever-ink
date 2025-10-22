import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SIMPLE_GUESTBOOK_CONTRACT_ADDRESS, SIMPLE_GUESTBOOK_ABI } from '@/lib/simple-contract';
import { toast } from 'sonner';

export interface BlockchainMessage {
  sender: string;
  content: string;
  timestamp: bigint;
  username: string;
  tag: string;
}

const isContractDeployed = SIMPLE_GUESTBOOK_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

export function useGuestbookContract() {
  // Read message count (only if deployed)
  const { data: messageCount, refetch: refetchMessageCount } = useReadContract({
    address: SIMPLE_GUESTBOOK_CONTRACT_ADDRESS,
    abi: SIMPLE_GUESTBOOK_ABI,
    functionName: 'getMessageCount',
    query: {
      enabled: isContractDeployed,
    },
  });

  // For now, we'll use a simplified approach - just return empty messages array
  // In a full implementation, you'd fetch individual messages using getMessage(index)
  const messages: BlockchainMessage[] = [];
  const isLoadingMessages = false;
  const refetchMessages = refetchMessageCount;

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
        address: SIMPLE_GUESTBOOK_CONTRACT_ADDRESS,
        abi: SIMPLE_GUESTBOOK_ABI,
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
    messages: messages,
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
