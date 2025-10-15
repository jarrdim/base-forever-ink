import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  Book, 
  Shield, 
  CheckCircle2, 
  Zap, 
  Users, 
  Wallet, 
  Edit3, 
  Infinity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function Homepage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnect = () => {
    const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
    setWalletAddress(mockAddress);
    setIsWalletConnected(true);
    toast.success('Wallet connected!');
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
    toast.info('Wallet disconnected');
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Navigation
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">Built on Base Layer 2</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Base Forever Book
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Leave Your Mark on the Blockchain Forever
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            The eternal guestbook for the Base ecosystem. Write your message, share your story, 
            and create a permanent record that will last as long as blockchain exists.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/guestbook">
              <Button size="lg" className="text-base px-8">
                Open Guestbook
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={scrollToFeatures} className="text-base px-8">
              Learn More
            </Button>
          </div>

          {/* Floating Book Icon */}
          <div className="mt-16 animate-slide-up">
            <div className="inline-block p-8 rounded-3xl glass hover-lift">
              <Book className="w-24 h-24 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-serif text-4xl font-bold text-center mb-4">
            Why Base Forever Book?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            A decentralized, permanent, and community-driven guestbook for the Base ecosystem
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="glass p-8 rounded-2xl hover-lift group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3">Permanent & Immutable</h3>
              <p className="text-muted-foreground">
                Your messages are stored on the Base blockchain forever. They can never be deleted, 
                censored, or lost.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-8 rounded-2xl hover-lift group">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3">Verified & Authentic</h3>
              <p className="text-muted-foreground">
                Every entry is cryptographically signed by your wallet, providing undeniable proof of authenticity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-8 rounded-2xl hover-lift group border-2 border-primary/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  ⛽ GASLESS
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3">Zero Gas Fees</h3>
              <p className="text-muted-foreground">
                Sign the guestbook completely FREE. We sponsor all transaction costs via Coinbase Paymaster - no ETH needed!
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass p-8 rounded-2xl hover-lift group">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-3">Community Driven</h3>
              <p className="text-muted-foreground">
                React to messages, engage with other signers, and be part of the growing Base community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-card/30">
        <div className="container mx-auto">
          <h2 className="font-serif text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to leave your permanent mark on the blockchain
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <div className="w-12 h-12 rounded-full bg-primary mx-auto flex items-center justify-center font-bold text-2xl">
                1
              </div>
              <h3 className="font-serif text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground text-sm">
                Connect your Base-compatible wallet (Coinbase Wallet, MetaMask, or any Web3 wallet)
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto border-2 border-accent">
                <Edit3 className="w-8 h-8 text-accent" />
              </div>
              <div className="w-12 h-12 rounded-full bg-accent mx-auto flex items-center justify-center font-bold text-2xl">
                2
              </div>
              <h3 className="font-serif text-xl font-semibold">Write Your Message</h3>
              <p className="text-muted-foreground text-sm">
                Craft your message (up to 280 characters), add your name, and choose a category tag
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto border-2 border-secondary">
                <Infinity className="w-8 h-8 text-secondary" />
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center font-bold text-2xl">
                3
              </div>
              <h3 className="font-serif text-xl font-semibold">Sign Forever</h3>
              <p className="text-muted-foreground text-sm">
                Sign the transaction (for FREE!) and your message lives on the blockchain eternally
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-serif text-4xl font-bold text-center mb-12">
            Join the Community
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="glass p-6 rounded-2xl text-center hover-lift">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-3xl font-bold text-primary mb-1">1,234+</div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </div>

            <div className="glass p-6 rounded-2xl text-center hover-lift">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-accent mb-1">567+</div>
              <div className="text-sm text-muted-foreground">Unique Signers</div>
            </div>

            <div className="glass p-6 rounded-2xl text-center hover-lift">
              <div className="text-4xl mb-2">❤️</div>
              <div className="text-3xl font-bold text-secondary mb-1">3,456+</div>
              <div className="text-sm text-muted-foreground">Total Reactions</div>
            </div>

            <div className="glass p-6 rounded-2xl text-center hover-lift">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-success mb-1">89+</div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="glass p-12 rounded-3xl text-center max-w-4xl mx-auto border-2 border-primary/30">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Ready to Leave Your Mark?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of builders, creators, and enthusiasts on Base
            </p>
            <Link to="/guestbook">
              <Button size="lg" className="text-lg px-12 py-6 h-auto">
                Open Guestbook
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              Free to use • Forever on-chain • No registration required
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
