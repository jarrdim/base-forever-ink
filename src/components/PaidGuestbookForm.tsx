import { useState, useEffect } from "react";
import { BookOpen, Loader2, CheckCircle, Wallet, Copy, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { usePaidGuestbook } from "@/hooks/usePaidGuestbook";
import { formatUnits } from "viem";

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

interface PaidGuestbookFormProps {
  isConnected: boolean;
  onSubmit: (message: string, username: string, tag?: TagType) => Promise<void>;
}

export const PaidGuestbookForm = ({ isConnected, onSubmit }: PaidGuestbookFormProps) => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [selectedTag, setSelectedTag] = useState<TagType | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { address } = useAccount();

  const {
    signGuestbook,
    approveUSDC,
    usdcBalance,
    usdcAllowance,
    needsApproval,
    signingFee,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    isSignPending,
    isSignConfirming,
    isSignConfirmed,
    refetchBalance,
    refetchAllowance,
    isContractDeployed,
  } = usePaidGuestbook();

  const maxMessageLength = 500;
  const maxUsernameLength = 50;
  const remainingChars = maxMessageLength - message.length;

  // Refresh balances after approval confirmed
  useEffect(() => {
    if (isApproveConfirmed) {
      refetchBalance();
      refetchAllowance();
      toast.success("USDC spending approved!");
    }
  }, [isApproveConfirmed, refetchBalance, refetchAllowance]);

  // Refresh and show success after sign confirmed
  useEffect(() => {
    if (isSignConfirmed) {
      toast.success("🎉 Message signed successfully!");
      refetchBalance();
      setMessage("");
      setUsername("");
      setSelectedTag(undefined);
      setIsSubmitting(false);
    }
  }, [isSignConfirmed, refetchBalance]);

  const handleApproveUSDC = async () => {
    try {
      await approveUSDC();
      toast.info("Approve transaction submitted. Waiting for confirmation...");
    } catch (error) {
      console.error("Approval failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Approval failed';
      toast.error(`Approval failed: ${errorMessage}`);
    }
  };

  const handleTransaction = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (message.length > maxMessageLength) {
      toast.error(`Message must be ${maxMessageLength} characters or less`);
      return;
    }

    if (needsApproval) {
      toast.error("Please approve USDC spending first");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Executing paid transaction...');
      
      await signGuestbook(
        message.trim(),
        username.trim() || 'Anonymous',
        selectedTag || ''
      );

      toast.info("Transaction submitted. Waiting for confirmation...");
      
      // Call the onSubmit callback to update the UI
      await onSubmit(message.trim(), username.trim(), selectedTag);
    } catch (error) {
      console.error("Transaction failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      toast.error(`Transaction failed: ${errorMessage}`);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTransaction();
  };

  const hasEnoughBalance = usdcBalance !== undefined && usdcBalance >= signingFee;
  const formattedBalance = usdcBalance ? formatUnits(usdcBalance, 6) : '0';
  const formattedFee = formatUnits(signingFee, 6);

  if (!isContractDeployed) {
    return (
      <div className="glass rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Contract Not Deployed</h3>
          <p className="text-muted-foreground">
            The paid guestbook contract needs to be deployed first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-serif font-semibold">Sign the Book</h2>
        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
          <DollarSign className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">{formattedFee} USDC per signature</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* USDC Balance and Approval Section */}
        {isConnected && (
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-medium">USDC Payment</h3>
            </div>

            <div className="space-y-4">
              {/* Balance Display */}
              <div className="flex justify-between items-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm text-muted-foreground">Your USDC Balance:</span>
                <span className={`font-bold text-lg ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                  {formattedBalance} USDC
                </span>
              </div>

              {/* Fee Display */}
              <div className="flex justify-between items-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm text-muted-foreground">Signing Fee:</span>
                <span className="font-bold text-lg text-green-400">{formattedFee} USDC</span>
              </div>

              {/* Wallet Address */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Connected Wallet</span>
                </div>
                <div className="flex items-center justify-between">
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
              </div>

              {/* Low Balance Warning */}
              {!hasEnoughBalance && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      Insufficient USDC balance. You need at least {formattedFee} USDC to sign.
                    </p>
                  </div>
                </div>
              )}

              {/* Approval Button */}
              {needsApproval && hasEnoughBalance && (
                <Button
                  type="button"
                  onClick={handleApproveUSDC}
                  disabled={isApprovePending || isApproveConfirming}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-4"
                >
                  {isApprovePending || isApproveConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isApprovePending ? 'Waiting for approval...' : 'Confirming approval...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve USDC Spending
                    </>
                  )}
                </Button>
              )}

              {/* Approval Success */}
              {!needsApproval && hasEnoughBalance && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-green-400 font-medium">
                      USDC spending approved! Ready to sign.
                    </p>
                  </div>
                </div>
              )}

              {/* Transaction Status */}
              {(isSignPending || isSignConfirming) && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    <p className="text-sm text-primary font-medium">
                      {isSignPending ? 'Waiting for wallet approval...' : 'Confirming transaction...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
            disabled={!isConnected || isSubmitting || isSignPending || isSignConfirming}
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
            disabled={!isConnected || isSubmitting || isSignPending || isSignConfirming}
            className="glass border-border bg-input text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
            maxLength={maxMessageLength}
          />
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-muted-foreground">
              {!isConnected && "Connect your wallet to sign"}
            </span>
            <span className={`font-medium ${remainingChars < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
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
                disabled={!isConnected || isSubmitting || isSignPending || isSignConfirming}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isConnected || isSubmitting || isSignPending || isSignConfirming || !message.trim() || needsApproval || !hasEnoughBalance}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting || isSignPending || isSignConfirming ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isSignPending ? 'Waiting for approval...' : isSignConfirming ? 'Confirming...' : 'Processing...'}
            </>
          ) : needsApproval ? (
            <>
              <AlertCircle className="mr-2 h-5 w-5" />
              Approve USDC First
            </>
          ) : !hasEnoughBalance ? (
            <>
              <AlertCircle className="mr-2 h-5 w-5" />
              Insufficient USDC Balance
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-5 w-5" />
              Sign Forever Book ({formattedFee} USDC)
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
