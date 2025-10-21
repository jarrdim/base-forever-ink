import { useState, useEffect } from "react";
import { BookOpen, Loader2, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAccount, useChainId } from "wagmi";
import { useUSDCBalance, useUSDCAllowance, useUSDCApprove, formatUSDC, parseUSDC } from "@/lib/usdc";
import { GUESTBOOK_CONTRACT_ADDRESS } from "@/lib/contract";

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
  const { data: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address, chainId);
  const { data: allowance, refetch: refetchAllowance } = useUSDCAllowance(address, GUESTBOOK_CONTRACT_ADDRESS, chainId);
  const { approve: approveUSDC } = useUSDCApprove(chainId);
  
  const signingFee = parseUSDC("1"); // 1 USDC
  const hasEnoughBalance = usdcBalance ? usdcBalance >= signingFee : false;
  const hasEnoughAllowance = allowance ? allowance >= signingFee : false;

  const maxMessageLength = 280;
  const maxUsernameLength = 50;
  const remainingChars = maxMessageLength - message.length;

  const handleApprove = async () => {
    if (!approveUSDC) return;
    
    setIsApproving(true);
    try {
      approveUSDC(GUESTBOOK_CONTRACT_ADDRESS, signingFee);
      toast.success("USDC approval successful!");
      // Refetch allowance after approval
      setTimeout(() => {
        refetchAllowance();
      }, 2000);
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Failed to approve USDC. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (message.length > maxMessageLength) {
      toast.error(`Message must be ${maxMessageLength} characters or less`);
      return;
    }

    if (!hasEnoughBalance) {
      toast.error("Insufficient USDC balance. You need 1 USDC to sign the guestbook.");
      return;
    }

    if (!hasEnoughAllowance) {
      toast.error("Please approve USDC spending first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message.trim(), username.trim(), selectedTag);
      setMessage("");
      setUsername("");
      setSelectedTag(undefined);
      toast.success("Your message has been added to the Forever Book!");
      // Refetch balance after successful transaction
      setTimeout(() => {
        refetchBalance();
        refetchAllowance();
      }, 2000);
    } catch (error) {
      toast.error("Failed to add message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        {/* USDC Payment Section */}
        {isConnected && (
          <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Payment Required</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Signing Fee:</span>
                <span className="font-medium">1 USDC</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Your USDC Balance:</span>
                <span className={`font-medium ${hasEnoughBalance ? 'text-green-400' : 'text-destructive'}`}>
                  {usdcBalance ? formatUSDC(usdcBalance) : '0'} USDC
                </span>
              </div>
              
              {hasEnoughBalance && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">USDC Approved:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${hasEnoughAllowance ? 'text-green-400' : 'text-yellow-400'}`}>
                      {allowance ? formatUSDC(allowance) : '0'} USDC
                    </span>
                    {hasEnoughAllowance && <CheckCircle className="h-4 w-4 text-green-400" />}
                  </div>
                </div>
              )}
            </div>
            
            {!hasEnoughBalance && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">
                  You need at least 1 USDC to sign the guestbook. Please add USDC to your wallet.
                </p>
              </div>
            )}
            
            {hasEnoughBalance && !hasEnoughAllowance && (
              <Button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 rounded-lg transition-all duration-300"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving USDC...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve 1 USDC
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={!isConnected || isSubmitting || !message.trim() || !hasEnoughBalance || !hasEnoughAllowance}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing & Paying...
            </>
          ) : (
            <>
              <BookOpen className="mr-2 h-5 w-5" />
              Sign for 1 USDC
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
