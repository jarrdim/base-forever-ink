import { GuestbookEntry } from "./GuestbookEntry";
import { TagType } from "./GuestbookForm";
import { BookOpen } from "lucide-react";

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

interface EntryListProps {
  entries: Entry[];
  isConnected: boolean;
  currentWallet?: string;
  userReactions: { [entryId: string]: string[] };
  onReact: (entryId: string, reactionType: keyof Reactions) => void;
}

export const EntryList = ({ entries, isConnected, currentWallet, userReactions, onReact }: EntryListProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-2xl animate-fade-in">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground text-lg font-medium mb-2">
          No results found
        </p>
        <p className="text-muted-foreground text-sm">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {entries.map((entry) => (
        <GuestbookEntry
          key={entry.id}
          {...entry}
          isConnected={isConnected}
          currentWallet={currentWallet}
          userReactions={userReactions[entry.id] || []}
          onReact={onReact}
        />
      ))}
    </div>
  );
};
