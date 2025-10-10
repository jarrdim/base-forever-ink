import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletConnectButtonProps {
  isConnected: boolean;
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnectButton = ({
  isConnected,
  walletAddress,
  onConnect,
  onDisconnect,
}: WalletConnectButtonProps) => {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          {shortenAddress(walletAddress)}
        </div>
        <Button
          onClick={onDisconnect}
          size="sm"
          variant="ghost"
          className="rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onConnect}
      className="glass rounded-full px-6 py-2 font-semibold bg-primary hover:bg-primary-hover transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
};
