import { useEffect, useState } from "react";
import { Clock, User, Wallet, Tag } from "lucide-react";
import { usePaidGuestbook, PaidMessage } from "@/hooks/usePaidGuestbook";
import { formatDistanceToNow } from "date-fns";

export const RecentSignatures = () => {
  const { messages, isLoadingMessages, refetchMessages } = usePaidGuestbook();
  const [recentMessages, setRecentMessages] = useState<PaidMessage[]>([]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      // Get last 10 messages (most recent first)
      const recent = [...messages].reverse().slice(0, 10);
      setRecentMessages(recent);
    }
  }, [messages]);

  // Refresh messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchMessages]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      milestone: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      building: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      shipped: "bg-green-500/20 text-green-300 border-green-500/30",
      thanks: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      hello: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      announcement: "bg-red-500/20 text-red-300 border-red-500/30",
      idea: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };
    return tagColors[tag] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  if (isLoadingMessages) {
    return (
      <div className="glass rounded-2xl p-8 animate-fade-in">
        <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Recent Signatures
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recentMessages || recentMessages.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 animate-fade-in">
        <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Recent Signatures
        </h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>No signatures yet. Be the first to sign!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 animate-fade-in">
      <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-2">
        <Clock className="h-6 w-6 text-primary" />
        Recent Signatures
        <span className="text-sm font-normal text-muted-foreground ml-auto">
          {messages.length} total
        </span>
      </h2>

      <div className="space-y-4">
        {recentMessages.map((message, index) => {
          const timestamp = Number(message.timestamp) * 1000;
          const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

          return (
            <div
              key={index}
              className="glass rounded-xl p-5 hover:bg-primary/5 transition-all duration-300 border border-border hover:border-primary/30"
            >
              {/* Header with wallet and timestamp */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(message.sender);
                      // toast.success("Address copied!");
                    }}
                    className="font-mono text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                    title="Click to copy address"
                  >
                    {formatAddress(message.sender)}
                  </button>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo}</span>
                </div>
              </div>

              {/* Username if provided */}
              {message.username && message.username !== "Anonymous" && (
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{message.username}</span>
                </div>
              )}

              {/* Message content */}
              <p className="text-foreground leading-relaxed mb-3">
                {message.content}
              </p>

              {/* Tag if provided */}
              {message.tag && (
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span
                    className={`text-xs px-3 py-1 rounded-full border ${getTagColor(
                      message.tag
                    )}`}
                  >
                    #{message.tag}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {messages.length > 10 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Showing 10 most recent signatures out of {messages.length} total
          </p>
        </div>
      )}
    </div>
  );
};
