import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Book, Home, Info } from 'lucide-react';

interface NavigationProps {
  isWalletConnected: boolean;
  walletAddress?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Navigation = ({ isWalletConnected, walletAddress, onConnect, onDisconnect }: NavigationProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Book className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xl font-bold text-foreground">
              Base Forever Book
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="w-4 h-4 inline mr-1" />
              Home
            </Link>
            <Link
              to="/guestbook"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/guestbook') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Book className="w-4 h-4 inline mr-1" />
              Guestbook
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Info className="w-4 h-4 inline mr-1" />
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isWalletConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium">{shortenAddress(walletAddress!)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  className="text-xs"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={onConnect} size="sm">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center gap-6 pb-3 border-t border-white/5 mt-2 pt-3">
          <Link
            to="/"
            className={`text-xs font-medium transition-colors hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            to="/guestbook"
            className={`text-xs font-medium transition-colors hover:text-primary ${
              isActive('/guestbook') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Guestbook
          </Link>
          <Link
            to="/about"
            className={`text-xs font-medium transition-colors hover:text-primary ${
              isActive('/about') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};
