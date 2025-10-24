import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const ConfessionForm = () => {
  const [confession, setConfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confession.trim()) {
      toast.error("Please write something before submitting");
      return;
    }

    if (confession.length > 1000) {
      toast.error("Confession must be less than 1000 characters");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("confessions")
      .insert([{ content: confession.trim() }]);

    if (error) {
      toast.error("Failed to submit confession. Please try again.");
      console.error("Error submitting confession:", error);
    } else {
      toast.success("Your confession has been posted anonymously!");
      setConfession("");
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="confession-card p-6 border-primary/20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="confession" className="block text-lg font-semibold mb-3 text-primary">
            Share Your Confession Anonymously
          </label>
          <Textarea
            id="confession"
            placeholder="What's on your mind? Share your thoughts, secrets, or confessions here... (Max 1000 characters)"
            value={confession}
            onChange={(e) => setConfession(e.target.value)}
            className="min-h-[150px] bg-muted/50 border-primary/30 focus:border-primary resize-none"
            maxLength={1000}
            aria-label="Confession text area"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {confession.length}/1000 characters
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !confession.trim()}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          size="lg"
        >
          <Send className="mr-2 h-5 w-5" />
          {isSubmitting ? "Posting..." : "Post Confession"}
        </Button>
      </form>
    </Card>
  );
};
