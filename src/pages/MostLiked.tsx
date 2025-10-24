import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ConfessionCard } from "@/components/ConfessionCard";

const MostLiked = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMostLikedConfessions();
  }, []);

  const fetchMostLikedConfessions = async () => {
    const { data: confessionsData } = await supabase
      .from("confessions")
      .select(`
        *,
        confession_likes(count)
      `)
      .order("created_at", { ascending: false });

    if (confessionsData) {
      const sorted = confessionsData
        .map(c => ({
          ...c,
          likes: c.confession_likes?.[0]?.count || 0
        }))
        .sort((a, b) => b.likes - a.likes);

      setConfessions(sorted);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Most Liked Confessions</h2>
          <p className="text-muted-foreground">Confessions with the most hearts</p>
        </div>

        {loading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="confession-card p-6 border-primary/20 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : confessions.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No confessions yet
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {confessions.map((confession) => (
              <ConfessionCard key={confession.id} confession={confession} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MostLiked;
