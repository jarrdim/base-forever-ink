import { useState, useRef, useMemo, useEffect } from "react";
import { useAccount } from 'wagmi';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GuestbookForm, TagType } from "@/components/GuestbookForm";
import { EntryList } from "@/components/EntryList";
import { SearchFilter } from "@/components/SearchFilter";
import { ContractStatus } from "@/components/ContractStatus";
import { toast } from "sonner";
import { useGuestbookContract } from "@/hooks/useGuestbookContract";
import { Crown } from "lucide-react";

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

export default function Guestbook() {
  const { address, isConnected } = useAccount();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [userReactions, setUserReactions] = useState<{ [entryId: string]: string[] }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTagFilter, setSelectedTagFilter] = useState<TagType | "all">("all");
  const entriesRef = useRef<HTMLDivElement>(null);

  // Blockchain integration
  const {
    messages,
    isLoadingMessages,
    signGuestbook,
    isWritePending,
    isConfirming,
    isConfirmed,
    transactionHash,
    refetchMessages,
    isContractDeployed,
  } = useGuestbookContract();

  // Load entries from blockchain when messages are fetched
  useEffect(() => {
    if (messages && messages.length > 0) {
      const blockchainEntries: Entry[] = messages.map((msg, index) => ({
        id: `${msg.sender}-${msg.timestamp.toString()}-${index}`,
        username: msg.username || 'Anonymous',
        walletAddress: msg.sender,
        message: msg.content,
        timestamp: new Date(Number(msg.timestamp) * 1000),
        txHash: transactionHash?.toString() || '',
        tag: msg.tag as TagType | undefined,
        reactions: { heart: 0, thumbsUp: 0, fire: 0, hundred: 0 },
      }));
      setEntries(blockchainEntries.reverse()); // Show newest first
    }
  }, [messages, transactionHash]);

  // Load reactions from localStorage
  useEffect(() => {
    const savedReactions = localStorage.getItem('base_guestbook_reactions');
    if (savedReactions) {
      try {
        setUserReactions(JSON.parse(savedReactions));
      } catch (e) {
        console.error('Failed to load reactions from localStorage', e);
      }
    }
  }, []);

  // Refetch messages when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Message saved permanently on the blockchain!');
      refetchMessages();
      setTimeout(() => {
        entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [isConfirmed, refetchMessages]);


  const handleSubmit = async (message: string, username: string, tag?: TagType) => {
    if (!address) return;

    try {
      await signGuestbook(message, username, tag || '');
      toast.info('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('Failed to submit message. Please try again.');
    }
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
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 pb-12">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-slide-up">
          {/* Owner Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass rounded-full border border-primary/30">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Guestbook by{' '}
              <span className="text-primary font-semibold">breybrooks.base.eth</span>
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            The Forever Guestbook
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Your message, immortalized on the blockchain
          </p>
          <p className="text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Write your thoughts, share your story, and leave your mark. Every entry is permanently stored on Base,
            creating a digital time capsule that will last forever. <span className="text-primary font-semibold">Completely gasless!</span>
          </p>
        </section>

        {/* Contract Status */}
        <ContractStatus />

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