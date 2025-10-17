import { Link, useLocation } from 'react-router-dom';
import { Book, Home, Info } from 'lucide-react';
import { WalletConnectButton } from './WalletConnectButton';

export const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
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
          </div>

          <div className="flex items-center gap-3">
            <WalletConnectButton />
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
