import { useState, useEffect } from "react";
import { BookOpen, Loader2, CheckCircle, Wallet, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAccount, useChainId } from "wagmi";
import { SIMPLE_GUESTBOOK_CONTRACT_ADDRESS, SIMPLE_GUESTBOOK_ABI } from '../lib/simple-contract';
import { useGuestbookContract } from "@/hooks/useGuestbookContract";

export type TagType = "milestone" | "building" | "shipped" | "thanks" | "hello" | "announcement" | "idea";

const TAGS: { value: TagType; label: string; color: string }[] = [
  { value: "milestone", label: "#milestone", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { value: "building", label: "#building", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "shipped", label: "#shipped", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  { value: "thanks", label: "#thanks", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  { value: "hello", label: "#hello", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { value: "announcement", label: "#announcement", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  { value: "idea", label: "#idea", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
];

interface GuestbookFormProps {
  isConnected: boolean;
  onSubmit: (message: string, username: string, tag?: TagType) => Promise<void>;
}

export const GuestbookForm = ({ isConnected, onSubmit }: GuestbookFormProps) => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [selectedTag, setSelectedTag] = useState<TagType | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  const { address } = useAccount();
  const chainId = useChainId();

  // Use regular contract interactions
  const {
    signGuestbook,
    isWritePending,
    isConfirming,
    isConfirmed,
    transactionHash,
  } = useGuestbookContract();

  const maxMessageLength = 280;
  const maxUsernameLength = 50;
  const remainingChars = maxMessageLength - message.length;



  const handleTransaction = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (message.length > maxMessageLength) {
      toast.error(`Message must be ${maxMessageLength} characters or less`);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Executing transaction...');
      
      // Execute the transaction using regular gas payment
      await signGuestbook(
        message.trim(),
        username.trim() || 'Anonymous',
        selectedTag || ''
      );

      console.log('Transaction sent!');
      
      // Call the onSubmit callback to update the UI
      await onSubmit(message.trim(), username.trim(), selectedTag);
      
      // Reset form
      setMessage("");
      setUsername("");
      setSelectedTag(undefined);
      
      toast.success("🎉 Message added to the Forever Book!");
    } catch (error) {
      console.error("Transaction failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      toast.error(`Transaction failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTransaction();
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-serif font-semibold">Sign the Book</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2 text-muted-foreground">
            Your Name (optional)
          </label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your name or stay anonymous"
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, maxUsernameLength))}
            disabled={!isConnected || isSubmitting}
            className="glass border-border bg-input text-foreground placeholder:text-muted-foreground"
            maxLength={maxUsernameLength}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2 text-muted-foreground">
            Your Message *
          </label>
          <Textarea
            id="message"
            placeholder="Leave your mark on the blockchain forever..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isConnected || isSubmitting}
            className="glass border-border bg-input text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
            maxLength={maxMessageLength}
          />
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-muted-foreground">
              {!isConnected && "Connect your wallet to sign"}
            </span>
            <span className={`font-medium ${remainingChars < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {/* Tag Selection */}
        <div>
          <label className="block text-sm font-medium mb-3 text-muted-foreground">
            Add a tag (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag.value ? undefined : tag.value)}
                disabled={!isConnected || isSubmitting}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                  selectedTag === tag.value
                    ? `${tag.color} scale-105`
                    : "bg-muted/20 text-muted-foreground border-border hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Info Section */}
        {isConnected && (
          <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Transaction Info</h3>
            </div>
            
            {/* Connected Wallet Info */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Connected Wallet</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-muted/50 px-3 py-1 rounded-md">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                  </span>
                  {address && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(address);
                        toast.success("Wallet address copied!");
                      }}
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                      title="Copy wallet address"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Connected</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Network Info */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">Base Sepolia Testnet</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Gas Fee:</span>
                <span className="font-medium text-yellow-400">Network Gas Required</span>
              </div>
            </div>

            {(isWritePending || isConfirming) && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <p className="text-sm text-primary font-medium">
                    {isWritePending ? 'Waiting for wallet approval...' : 'Confirming transaction...'}
                  </p>
                </div>
              </div>
            )}

            {isConfirmed && transactionHash && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-green-400 font-medium">
                    Transaction confirmed!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isConnected || isSubmitting || isWritePending || isConfirming || !message.trim()}
          className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 text-white font-semibold py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting || isWritePending || isConfirming ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isWritePending ? 'Waiting for approval...' : isConfirming ? 'Confirming...' : 'Processing...'}
            </>
          ) : (
            <>
              <BookOpen className="mr-2 h-5 w-5" />
              Sign Forever Book
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
