import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Copy, Check, ExternalLink, Heart, ThumbsUp, Flame, Star, Twitter, Facebook, Linkedin, MessageSquare } from "lucide-react";
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
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleReaction = (reactionType: keyof Reactions) => {
    setAnimatingReaction(reactionType);
    onReact(id, reactionType);
    setTimeout(() => setAnimatingReaction(null), 600);
  };

  const reactionButtons = [
    { type: 'heart' as keyof Reactions, emoji: '❤️' },
    { type: 'thumbsUp' as keyof Reactions, emoji: '👍' },
    { type: 'fire' as keyof Reactions, emoji: '🔥' },
    { type: 'hundred' as keyof Reactions, emoji: '💯' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-bold text-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{username}</h3>
              {tag && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${TAG_COLORS[tag]}`}>
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
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>

      <p className="font-serif text-white leading-relaxed mb-4 text-lg">
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

      {/* Social Sharing Buttons */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-gray-500 mr-2">Share:</span>
        
        {/* Twitter Share */}
        <button
          onClick={() => {
            const text = `"${message}" - ${username} on Base Forever Ink`;
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
            window.open(url, '_blank', 'width=550,height=420');
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
          title="Share on Twitter"
        >
          <Twitter className="h-3 w-3" />
          <span>Twitter</span>
        </button>

        {/* Facebook Share */}
        <button
          onClick={() => {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
            window.open(url, '_blank', 'width=550,height=420');
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors border border-blue-200"
          title="Share on Facebook"
        >
          <Facebook className="h-3 w-3" />
          <span>Facebook</span>
        </button>

        {/* LinkedIn Share */}
        <button
          onClick={() => {
            const text = `"${message}" - ${username} on Base Forever Ink`;
            const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(text)}`;
            window.open(url, '_blank', 'width=550,height=420');
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
          title="Share on LinkedIn"
        >
          <Linkedin className="h-3 w-3" />
          <span>LinkedIn</span>
        </button>

        {/* Copy Message */}
        <button
          onClick={() => {
            const textToCopy = `"${message}" - ${username} on Base Forever Ink\n\nView on blockchain: https://basescan.org/tx/${txHash}`;
            navigator.clipboard.writeText(textToCopy);
            toast.success('Message copied to clipboard!');
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
          title="Copy message"
        >
          <MessageSquare className="h-3 w-3" />
          <span>Copy</span>
        </button>
      </div>

      {/* Transaction Hash */}
      <div className="flex items-center justify-between">
        <a
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors font-medium"
        >
          View on BaseScan
          <ExternalLink className="h-3 w-3" />
        </a>
        
        {/* Transaction Hash Display */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>TX:</span>
          <span className="font-mono">{txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};
