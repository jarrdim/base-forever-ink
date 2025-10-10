import { GuestbookEntry } from "./GuestbookEntry";

interface Entry {
  id: string;
  username: string;
  walletAddress: string;
  message: string;
  timestamp: Date;
  txHash: string;
}

interface EntryListProps {
  entries: Entry[];
}

export const EntryList = ({ entries }: EntryListProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 glass rounded-2xl">
        <p className="text-muted-foreground text-lg">
          No entries yet. Be the first to sign the Forever Book!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {entries.map((entry) => (
        <GuestbookEntry key={entry.id} {...entry} />
      ))}
    </div>
  );
};
