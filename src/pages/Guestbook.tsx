import { useState, useRef, useMemo, useEffect } from "react";
import { useAccount } from 'wagmi';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GuestbookForm, TagType } from "@/components/GuestbookForm";
import { EntryList } from "@/components/EntryList";
import { SearchFilter } from "@/components/SearchFilter";
import { toast } from "sonner";

interface Reactions {
  heart: number;
  thumbsUp: number;
  fire: number;
  hundred: number;
}

interface Entry {
  id: string;
  username: string;
  walletAddress: string;
  message: string;
  timestamp: Date;
  txHash: string;
  tag?: TagType;
  reactions: Reactions;
}

// Mock data with tags and reactions
const MOCK_ENTRIES: Entry[] = [];

export default function Guestbook() {
  const { address, isConnected } = useAccount();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [userReactions, setUserReactions] = useState<{ [entryId: string]: string[] }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTagFilter, setSelectedTagFilter] = useState<TagType | "all">("all");
  const entriesRef = useRef<HTMLDivElement>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('base_guestbook_entries');
    const savedReactions = localStorage.getItem('base_guestbook_reactions');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        // Convert timestamp strings back to Date objects
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setEntries(entriesWithDates);
      } catch (e) {
        console.error('Failed to load entries from localStorage', e);
      }
    }
    if (savedReactions) {
      try {
        setUserReactions(JSON.parse(savedReactions));
      } catch (e) {
        console.error('Failed to load reactions from localStorage', e);
      }
    }
  }, []);

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

  const handleSubmit = async (message: string, username: string, tag?: TagType) => {
    if (!address) return;

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newEntry: Entry = {
      id: Date.now().toString(),
      username,
      walletAddress: address,
      message,
      timestamp: new Date(),
      txHash: "0x" + Math.random().toString(16).substring(2, 66),
      tag,
      reactions: { heart: 0, thumbsUp: 0, fire: 0, hundred: 0 },
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    // Save to localStorage for persistence
    localStorage.setItem('base_guestbook_entries', JSON.stringify(updatedEntries));
    toast.success('Message saved permanently!');

    setTimeout(() => {
      entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReact = (entryId: string, reactionType: keyof Reactions) => {
    if (!address) return;

    const updatedEntries = entries.map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            reactions: {
              ...entry.reactions,
              [reactionType]: entry.reactions[reactionType] + 1,
            },
          }
        : entry
    );
    
    setEntries(updatedEntries);
    localStorage.setItem('base_guestbook_entries', JSON.stringify(updatedEntries));

    const updatedReactions = {
      ...userReactions,
      [entryId]: [...(userReactions[entryId] || []), reactionType],
    };
    
    setUserReactions(updatedReactions);
    localStorage.setItem('base_guestbook_reactions', JSON.stringify(updatedReactions));
  };

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        switch (dateFilter) {
          case "today":
            return entryDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return entryDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return entryDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Tag filter
    if (selectedTagFilter !== "all") {
      filtered = filtered.filter((entry) => entry.tag === selectedTagFilter);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case "reactions":
        sorted.sort((a, b) => {
          const aTotal = Object.values(a.reactions).reduce((sum, val) => sum + val, 0);
          const bTotal = Object.values(b.reactions).reduce((sum, val) => sum + val, 0);
          return bTotal - aTotal;
        });
        break;
    }

    return sorted;
  }, [entries, searchQuery, dateFilter, sortBy, selectedTagFilter]);

  const activeFiltersCount = [
    searchQuery !== "",
    dateFilter !== "all",
    sortBy !== "newest",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setSortBy("newest");
  };

  const allTags: (TagType | "all")[] = ["all", "milestone", "building", "shipped", "thanks", "hello", "announcement", "idea"];
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length };
    entries.forEach((entry) => {
      if (entry.tag) {
        counts[entry.tag] = (counts[entry.tag] || 0) + 1;
      }
    });
    return counts;
  }, [entries]);

  return (
    <div className="min-h-screen">
      <Navigation
        isWalletConnected={isWalletConnected || isConnected}
        walletAddress={walletAddress || address}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 pb-12">
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
              {filteredAndSortedEntries.length} {filteredAndSortedEntries.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* Search and Filter */}
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
          />

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                  selectedTagFilter === tag
                    ? "bg-primary/20 text-primary border-primary/30 scale-105"
                    : "glass border-border hover:scale-105"
                }`}
              >
                {tag === "all" ? "All Tags" : `#${tag}`}
                {tagCounts[tag] > 0 && (
                  <span className="ml-2 opacity-70">({tagCounts[tag]})</span>
                )}
              </button>
            ))}
          </div>

          <EntryList
            entries={filteredAndSortedEntries}
            isConnected={isConnected}
            currentWallet={address}
            userReactions={userReactions}
            onReact={handleReact}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}