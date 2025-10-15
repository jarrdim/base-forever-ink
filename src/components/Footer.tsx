import { Link } from 'react-router-dom';
import { Book, Github, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left - Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Book className="w-6 h-6 text-primary" />
              <span className="font-serif text-lg font-bold">Base Forever Book</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The eternal guestbook for the Base ecosystem
            </p>
          </div>

          {/* Center - Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Navigation</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/guestbook" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Guestbook
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <a 
                href="https://docs.base.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Base Docs
              </a>
            </div>
          </div>

          {/* Right - Social */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Community</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            Powered by <span className="text-primary font-medium">Base</span> • Built with ❤️ for the community
          </p>
          <p>© {new Date().getFullYear()} Base Forever Book. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
