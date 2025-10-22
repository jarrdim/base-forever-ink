import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle2, 
  Circle, 
  Clock,
  Github,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

export default function About() {
  const copyProjectId = () => {
    navigator.clipboard.writeText('9bf0183349252b3da5a51e76f76d6761');
    toast.success('Project ID copied!');
  };

  return (
    <div className="min-h-screen relative z-10">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-8 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            About Base Forever Book
          </h1>
          <p className="text-lg text-muted-foreground">
            Building the eternal record of the Base ecosystem
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-6 md:p-8 rounded-2xl">
            <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
              <Book className="w-7 h-7 text-primary" />
              Our Mission
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-3">
              Base Forever Book exists to create a permanent, decentralized space where the Base 
              community can share their stories, celebrate milestones, and leave their mark on 
              blockchain history.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe that important moments deserve to be preserved forever, not locked in 
              centralized databases that can disappear. By leveraging the immutability of blockchain 
              technology, we're creating a digital time capsule that will outlast us all.
            </p>
          </div>
        </div>
      </section>

      {/* Gasless Transactions Section - PROMINENT */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-6 md:p-8 rounded-2xl border-2 border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-bold">Gasless Signing with Paymaster</h2>
                  <p className="text-sm text-primary">Powered by Coinbase Developer Platform</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    <strong>We've integrated Coinbase Paymaster</strong> to sponsor all gas fees
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    <strong>Sign the guestbook completely FREE</strong> - we cover all transaction costs
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    <strong>No need to hold ETH</strong> in your wallet to participate
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    Makes blockchain accessible to <strong>everyone</strong>, regardless of crypto holdings
                  </p>
                </div>
              </div>

              <div className="glass p-6 rounded-xl bg-card/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Paymaster Configuration
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Project ID:</span>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-muted/30 font-mono text-xs">
                        9bf0183349252b3da5a51e76f76d6761
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyProjectId}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="flex items-center gap-2 text-success">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="text-primary font-medium">Base</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-muted-foreground mb-4">
                  This removes the biggest barrier to blockchain adoption - gas fees - and makes it 
                  possible for anyone to leave their permanent mark on Base.
                </p>
                <a
                  href="https://portal.cdp.coinbase.com/products/bundler-and-paymaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Learn more about Coinbase Paymaster
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-6 md:p-8 rounded-2xl">
            <h2 className="font-serif text-3xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-accent" />
              Built on Base
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next 
              billion users onchain. We chose Base for its:
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Zap className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Sub-second confirmation times</p>
              </div>
              <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                <Shield className="w-8 h-8 text-success mb-2" />
                <h3 className="font-semibold mb-1">Ultra Secure</h3>
                <p className="text-sm text-muted-foreground">Built on Ethereum security</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <Users className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold mb-1">Developer Friendly</h3>
                <p className="text-sm text-muted-foreground">Easy to build and deploy</p>
              </div>
            </div>
            <a
              href="https://docs.base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Read Base Documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-2xl font-bold mb-5 text-center">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Wallet Integration (RainbowKit)',
              'On-chain Message Storage',
              'Emoji Reaction System',
              'Advanced Search & Filtering',
              'Message Tag Categories',
              'Cryptographic Verification',
              'Real-time Updates',
              'Mobile Responsive Design',
              'Gasless Transactions',
              'Community Statistics'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 glass p-4 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">
            What's Next?
          </h2>
          <div className="space-y-3">
            <div className="glass p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Completed</h3>
                  <p className="text-muted-foreground">
                    Core guestbook functionality, reactions, search, filtering, and tag system
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl border-2 border-primary/50">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">In Progress</h3>
                  <p className="text-muted-foreground">
                    Smart contract integration, gasless transactions via Paymaster, on-chain storage
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Planned</h3>
                  <ul className="text-muted-foreground space-y-2 mt-2">
                    <li>• Event-specific guestbooks</li>
                    <li>• NFT receipts for signatures</li>
                    <li>• IPFS integration for media</li>
                    <li>• Basename integration</li>
                    <li>• Advanced analytics dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-6 md:p-8 rounded-2xl text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Built for Base Buildathon
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              This project was created as part of the Base Batches 002 Buildathon, showcasing 
              the power of building on Base with gasless transactions powered by Coinbase Paymaster.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href="https://docs.base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Base Docs
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Open source and community-driven
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 px-4 mb-8">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-6 rounded-2xl">
            <h2 className="font-serif text-2xl font-bold mb-4 text-center">
              Get Involved
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              Have questions, suggestions, or want to contribute? We'd love to hear from you!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm">Report Issues</Button>
              <Button variant="outline" size="sm">Request Features</Button>
              <Button variant="outline" size="sm">Join Community</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
