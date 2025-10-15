import { useState, useRef, useMemo } from "react";
import { BookMarked, Github, Twitter } from "lucide-react";
import { useAccount } from 'wagmi';
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { GuestbookForm, TagType } from "@/components/GuestbookForm";
import { EntryList } from "@/components/EntryList";
import { SearchFilter } from "@/components/SearchFilter";

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

const Index = () => {
  const { address, isConnected } = useAccount();
  const [entries, setEntries] = useState<Entry[]>(MOCK_ENTRIES);
  const [userReactions, setUserReactions] = useState<{ [entryId: string]: string[] }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTagFilter, setSelectedTagFilter] = useState<TagType | "all">("all");
  const entriesRef = useRef<HTMLDivElement>(null);

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

    setEntries([newEntry, ...entries]);

    setTimeout(() => {
      entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReact = (entryId: string, reactionType: keyof Reactions) => {
    if (!address) return;

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              reactions: {
                ...entry.reactions,
                [reactionType]: entry.reactions[reactionType] + 1,
              },
            }
          : entry
      )
    );

    setUserReactions((prev) => {
      const entryReactions = prev[entryId] || [];
      return {
        ...prev,
        [entryId]: [...entryReactions, reactionType],
      };
    });
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