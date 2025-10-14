import { useState, useRef } from "react";
import { BookMarked, Github, Twitter } from "lucide-react";
import { useAccount } from 'wagmi';
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { GuestbookForm } from "@/components/GuestbookForm";
import { EntryList } from "@/components/EntryList";

// Mock data for demonstration (commented out - starts with 0 entries)
const MOCK_ENTRIES: any[] = [];

const Index = () => {
  const { address, isConnected } = useAccount();
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const entriesRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (message: string, username: string) => {
    if (!address) return;

    // Simulate blockchain transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newEntry = {
      id: Date.now().toString(),
      username,
      walletAddress: address,
      message,
      timestamp: new Date(),
      txHash: "0x" + Math.random().toString(16).substring(2, 66),
    };

    setEntries([newEntry, ...entries]);

    // Smooth scroll to entries
    setTimeout(() => {
      entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="h-8 w-8 text-primary" />
            <span className="text-xl font-serif font-bold">Base Forever Book</span>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            The Forever Guestbook
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Your message, immortalized on the blockchain
          </p>
          <p className="text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Write your thoughts, share your story, and leave your mark. Every entry is permanently stored on Base,
            creating a digital time capsule that will last forever.
          </p>
        </section>

        {/* Form Section */}
        <section className="mb-16">
          <GuestbookForm isConnected={isConnected} onSubmit={handleSubmit} />
        </section>

        {/* Entries Section */}
        <section ref={entriesRef}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold">Recent Signatures</h2>
            <span className="text-sm text-muted-foreground">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <EntryList entries={entries} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 glass rounded-full text-sm font-semibold">
                ⚡ Powered by Base
              </div>
              <a
                href="https://docs.base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Base Documentation
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;