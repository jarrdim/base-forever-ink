import { Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface GuestbookEntryProps {
  id: string;
  username: string;
  walletAddress: string;
  message: string;
  timestamp: Date;
  txHash: string;
}

export const GuestbookEntry = ({
  username,
  walletAddress,
  message,
  timestamp,
  txHash,
}: GuestbookEntryProps) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="paper-texture rounded-xl p-6 hover-lift animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-xl text-gray-900 mb-1">
            {username || "Anonymous"}
          </h3>
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
