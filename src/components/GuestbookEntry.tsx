import { Copy, ExternalLink, Check, Heart, ThumbsUp, Flame, Star } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { TagType } from "./GuestbookForm";

const TAG_COLORS: Record<TagType, string> = {
  milestone: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  building: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  shipped: "bg-green-500/20 text-green-300 border-green-500/30",
  thanks: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  hello: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  announcement: "bg-red-500/20 text-red-300 border-red-500/30",
  idea: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

interface Reactions {
  heart: number;
  thumbsUp: number;
  fire: number;
  hundred: number;
}

interface GuestbookEntryProps {
  id: string;
  username: string;
  walletAddress: string;
  message: string;
  timestamp: Date;
  txHash: string;
  tag?: TagType;
  reactions: Reactions;
  userReactions: string[];
  isConnected: boolean;
  currentWallet?: string;
  onReact: (entryId: string, reactionType: keyof Reactions) => void;
}

export const GuestbookEntry = ({
  id,
  username,
  walletAddress,
  message,
  timestamp,
  txHash,
  tag,
  reactions,
  userReactions,
  isConnected,
  onReact,
}: GuestbookEntryProps) => {
  const [copied, setCopied] = useState(false);
  const [animatingReaction, setAnimatingReaction] = useState<keyof Reactions | null>(null);

  const reactionButtons: { type: keyof Reactions; icon: any; emoji: string }[] = [
    { type: "heart", icon: Heart, emoji: "❤️" },
    { type: "thumbsUp", icon: ThumbsUp, emoji: "👍" },
    { type: "fire", icon: Flame, emoji: "🔥" },
    { type: "hundred", icon: Star, emoji: "💯" },
  ];

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const handleReaction = (reactionType: keyof Reactions) => {
    if (!isConnected) {
      toast.error("Connect your wallet to react");
      return;
    }
    onReact(id, reactionType);
    setAnimatingReaction(reactionType);
    setTimeout(() => setAnimatingReaction(null), 300);
  };

  return (
    <div className="paper-texture rounded-xl p-6 hover-lift animate-fade-in transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif font-semibold text-xl text-gray-900">
              {username || "Anonymous"}
            </h3>
            {tag && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${TAG_COLORS[tag]}`}>
                #{tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-mono">{shortenAddress(walletAddress)}</span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>

      <p className="font-serif text-gray-800 leading-relaxed mb-4 text-lg">
        "{message}"
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {reactionButtons.map(({ type, emoji }) => {
          const isUserReacted = userReactions.includes(type);
          const count = reactions[type];
          
          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={!isConnected}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                isUserReacted
                  ? "bg-primary/20 text-primary border-primary/30 scale-105"
                  : "bg-muted/20 text-muted-foreground border-border hover:scale-105 hover:bg-muted/30"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className={animatingReaction === type ? "animate-scale-in" : ""}>
                {emoji}
              </span>
              <span className={`transition-transform duration-300 ${animatingReaction === type ? "scale-125" : ""}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <a
        href={`https://basescan.org/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors font-medium"
      >
        View on BaseScan
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
};
