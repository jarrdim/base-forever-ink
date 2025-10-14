import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div>
            {!connected ? (
              <Button
                onClick={openConnectModal}
                className="glass rounded-full px-6 py-2 font-semibold bg-primary hover:bg-primary-hover transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
                {chain.unsupported ? (
                  <Button
                    onClick={openChainModal}
                    size="sm"
                    variant="destructive"
                    className="rounded-full"
                  >
                    Wrong Network
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    {account.displayName}
                  </div>
                )}
                <Button
                  onClick={openAccountModal}
                  size="sm"
                  variant="ghost"
                  className="rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};