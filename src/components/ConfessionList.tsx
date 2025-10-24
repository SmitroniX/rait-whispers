import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConfessionCard } from "./ConfessionCard";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

type Confession = {
  id: string;
  content: string;
  created_at: string;
};

export const ConfessionList = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfessions();
    
    const channel = supabase
      .channel("confessions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "confessions",
        },
        () => {
          fetchConfessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConfessions = async () => {
    const { data, error } = await supabase
      .from("confessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching confessions:", error);
    } else {
      setConfessions(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="confession-card p-6 border-primary/20 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (confessions.length === 0) {
    return (
      <Card className="confession-card p-12 border-primary/20 text-center">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-primary/50" />
        <h3 className="text-xl font-semibold mb-2">No Confessions Yet</h3>
        <p className="text-muted-foreground">Be the first to share your thoughts anonymously!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {confessions.map((confession, index) => (
        <ConfessionCard
          key={confession.id}
          confession={confession}
        />
      ))}
    </div>
  );
};
