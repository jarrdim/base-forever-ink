import { useState, useRef } from "react";
import { BookMarked, Github, Twitter } from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { GuestbookForm } from "@/components/GuestbookForm";
import { EntryList } from "@/components/EntryList";

// Mock data for demonstration
const MOCK_ENTRIES = [
  {
    id: "1",
    username: "Vitalik",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    message: "Building on Base is incredibly smooth. The future of Layer 2 is here!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    txHash: "0xabcd1234ef5678901234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "2",
    username: "",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    message: "First time using a guestbook on-chain. This is amazing! Forever preserved.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    txHash: "0x1234abcd5678ef901234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "3",
    username: "Alice",
    walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
    message: "Love the vintage book aesthetic! Really captures the permanence of blockchain.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    txHash: "0xef901234abcd5678901234567890abcdef1234567890abcdef1234567890abcd",
  },
  {
    id: "4",
    username: "CryptoBuilder",
    walletAddress: "0x5678901234abcdef5678901234abcdef56789012",
    message: "Base is the perfect L2 for this project. Fast, cheap, and reliable!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
  },
  {
    id: "5",
    username: "Web3Enthusiast",
    walletAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
    message: "The glassmorphism design is stunning. Perfect blend of modern and classic!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    txHash: "0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  },
  {
    id: "6",
    username: "",
    walletAddress: "0x1111222233334444555566667777888899990000",
    message: "My first blockchain transaction! So excited to be part of this community.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "7",
    username: "Sarah",
    walletAddress: "0x2222333344445555666677778888999900001111",
    message: "The character counter is a nice touch. Makes me think carefully about my words.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "8",
    username: "BlockchainArtist",
    walletAddress: "0x3333444455556666777788889999000011112222",
    message: "Creating digital permanence, one message at a time. This is why I love Web3!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    txHash: "0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
  },
];

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const entriesRef = useRef<HTMLDivElement>(null);

  const handleConnect = () => {
    // Mock wallet connection
    const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
    setWalletAddress(mockAddress);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
  };

  const handleSubmit = async (message: string, username: string) => {
    // Simulate blockchain transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newEntry = {
      id: Date.now().toString(),
      username,
      walletAddress: walletAddress!,
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
          <WalletConnectButton
            isConnected={isConnected}
            walletAddress={walletAddress}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
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
