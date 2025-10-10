import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface GuestbookFormProps {
  isConnected: boolean;
  onSubmit: (message: string, username: string) => Promise<void>;
}

export const GuestbookForm = ({ isConnected, onSubmit }: GuestbookFormProps) => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxMessageLength = 280;
  const maxUsernameLength = 50;
  const remainingChars = maxMessageLength - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (message.length > maxMessageLength) {
      toast.error(`Message must be ${maxMessageLength} characters or less`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message.trim(), username.trim());
      setMessage("");
      setUsername("");
      toast.success("Your message has been added to the Forever Book!");
    } catch (error) {
      toast.error("Failed to add message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-serif font-semibold">Sign the Book</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2 text-muted-foreground">
            Your Name (optional)
          </label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your name or stay anonymous"
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, maxUsernameLength))}
            disabled={!isConnected || isSubmitting}
            className="glass border-border bg-input text-foreground placeholder:text-muted-foreground"
            maxLength={maxUsernameLength}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2 text-muted-foreground">
            Your Message *
          </label>
          <Textarea
            id="message"
            placeholder="Leave your mark on the blockchain forever..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isConnected || isSubmitting}
            className="glass border-border bg-input text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
            maxLength={maxMessageLength}
          />
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-muted-foreground">
              {!isConnected && "Connect your wallet to sign"}
            </span>
            <span className={`font-medium ${remainingChars < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isConnected || isSubmitting || !message.trim()}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing...
            </>
          ) : (
            <>
              <BookOpen className="mr-2 h-5 w-5" />
              Sign the Forever Book
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
