import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const ConfessionForm = () => {
  const [confession, setConfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get user's IP address
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => localStorage.setItem("user_ip", data.ip))
      .catch(() => localStorage.setItem("user_ip", "unknown"));
  }, []);

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

    const ipAddress = localStorage.getItem("user_ip") || "unknown";

    const { error } = await supabase
      .from("confessions")
      .insert([{ 
        content: confession.trim(),
        ip_address: ipAddress
      }]);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          id="confession"
          placeholder="What's on your mind? Share anonymously..."
          value={confession}
          onChange={(e) => setConfession(e.target.value)}
          className="min-h-[120px] resize-none"
          maxLength={1000}
          aria-label="Confession text area"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {confession.length}/1000 characters left
        </p>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !confession.trim()}
        className="w-full"
        size="lg"
      >
        <Send className="mr-2 h-4 w-4" />
        Post Anonymously
      </Button>
    </form>
  );
};
