import { useState, useRef, useMemo, useEffect } from "react";
import { useAccount } from 'wagmi';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PaidGuestbookForm, TagType } from "@/components/PaidGuestbookForm";
import { RecentSignatures } from "@/components/RecentSignatures";
import { EntryList } from "@/components/EntryList";
import { SearchFilter } from "@/components/SearchFilter";
import { ContractStatus } from "@/components/ContractStatus";
import { toast } from "sonner";
import { usePaidGuestbook } from "@/hooks/usePaidGuestbook";
import { useUserAuth } from "@/hooks/useUserAuth";
import { guestbookApi, activityApi } from "@/lib/api";
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
  const { user, isAuthenticated, logActivity, updateUserStats } = useUserAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [userReactions, setUserReactions] = useState<{ [entryId: string]: string[] }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTagFilter, setSelectedTagFilter] = useState<TagType | "all">("all");
  const entriesRef = useRef<HTMLDivElement>(null);

  // Blockchain integration with paid guestbook
  const {
    messages,
    isLoadingMessages,
    signGuestbook,
    isSignPending,
    isSignConfirming,
    isSignConfirmed,
    signHash,
    refetchMessages,
    isContractDeployed,
  } = usePaidGuestbook();

  // Load entries from blockchain when messages are fetched
  useEffect(() => {
    if (messages && messages.length > 0) {
      const blockchainEntries: Entry[] = messages.map((msg, index) => {
        // Generate a unique transaction hash placeholder for each message
        // In a real implementation, you'd get this from events or store it in the contract
        const uniqueTxHash = `0x${msg.sender.slice(2, 10)}${msg.timestamp.toString(16)}${index.toString(16).padStart(4, '0')}`;
        
        return {
          id: `${msg.sender}-${msg.timestamp.toString()}-${index}`,
          username: msg.username || 'Anonymous',
          walletAddress: msg.sender,
          message: msg.content,
          timestamp: new Date(Number(msg.timestamp) * 1000),
          txHash: uniqueTxHash,
          tag: msg.tag as TagType | undefined,
          reactions: { heart: 0, thumbsUp: 0, fire: 0, hundred: 0 },
        };
      });
      
      // Load existing reactions from localStorage
      const savedReactions = localStorage.getItem('base_guestbook_entries');
      if (savedReactions) {
        try {
          const savedEntries = JSON.parse(savedReactions);
          // Merge reactions from saved entries
          blockchainEntries.forEach(entry => {
            const savedEntry = savedEntries.find((saved: Entry) => saved.id === entry.id);
            if (savedEntry) {
              entry.reactions = savedEntry.reactions;
            }
          });
        } catch (e) {
          console.error('Failed to load saved reactions', e);
        }
      }
      
      setEntries(blockchainEntries.reverse()); // Show newest first
    }
  }, [messages]);

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

  // Save to database and refetch messages when transaction is confirmed
  useEffect(() => {
    if (isSignConfirmed && signHash && user) {
      const saveToDatabase = async () => {
        try {
          // Get the latest message from blockchain to save to database
          const refetchResult = await refetchMessages();
          const latestMessages = refetchResult.data;
          if (latestMessages && latestMessages.length > 0) {
            const latestMessage = latestMessages[0]; // Most recent message
            
            // Save to database
            const response = await guestbookApi.saveMessage(
              user.userId,
              user.walletAddress,
              latestMessage.username || user.username || 'Anonymous',
              latestMessage.content,
              signHash,
              latestMessage.tag as TagType | undefined
            );

            if (response.data) {
              // Log activity
              await logActivity('message_posted', {
                messageId: response.data.message.messageId,
                message: latestMessage.content,
                tag: latestMessage.tag,
                txHash: signHash
              });

              // Update user stats
              updateUserStats(1, 0);
              
              toast.success('Message saved permanently on the blockchain and database!');
            } else {
              console.error('Failed to save to database:', response.error);
              toast.success('Message saved on blockchain! (Database sync pending)');
            }
          }
        } catch (error) {
          console.error('Error saving to database:', error);
          toast.success('Message saved on blockchain! (Database sync pending)');
        }
      };

      saveToDatabase();
      
      setTimeout(() => {
        entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [isSignConfirmed, signHash, user, refetchMessages, logActivity, updateUserStats]);


  const handleSubmit = async (message: string, username: string, tag?: TagType) => {
    if (!address || !user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await signGuestbook(message, username, tag || '');
      toast.info('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('Failed to submit message. Please try again.');
    }
  };

  const handleReact = async (entryId: string, reactionType: keyof Reactions) => {
    if (!address || !user) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if user already reacted with this type
    if (userReactions[entryId]?.includes(reactionType)) {
      toast.info('You already reacted with this emoji');
      return;
    }

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

    // Save reaction to database
    try {
      const response = await guestbookApi.addReaction(entryId, user.userId, reactionType);
      
      if (response.data) {
        // Log activity
        await logActivity('reaction_added', {
          entryId,
          reactionType,
          targetUser: entries.find(e => e.id === entryId)?.walletAddress
        });

        // Update user stats
        updateUserStats(0, 1);
      } else {
        console.error('Failed to save reaction to database:', response.error);
      }
    } catch (error) {
      console.error('Error saving reaction to database:', error);
    }
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
    <div className="min-h-screen relative z-10">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <section className="text-center mb-10 animate-slide-up">
          {/* Owner Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 glass rounded-full border border-primary/30">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Guestbook by{' '}
              <span className="text-primary font-semibold">breybrooks.base.eth</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            The Forever Guestbook
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-3 max-w-2xl mx-auto">
            Your message, immortalized on the blockchain
          </p>
          <p className="text-sm text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Write your thoughts, share your story, and leave your mark. Every entry is permanently stored on Base,
            creating a digital time capsule that will last forever. <span className="text-primary font-semibold">Completely gasless!</span>
          </p>
        </section>

        {/* Contract Status */}
        <ContractStatus />

        {/* Form Section */}
        <section className="mb-10">
          <PaidGuestbookForm isConnected={isConnected} onSubmit={handleSubmit} />
        </section>

        {/* Recent Signatures Section */}
        <section className="mb-10">
          <RecentSignatures />
        </section>

        {/* Entries Section */}
        <section ref={entriesRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Recent Signatures</h2>
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