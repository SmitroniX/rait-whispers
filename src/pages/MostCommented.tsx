import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

const MostCommented = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchMostCommented();
    checkAdminStatus();

    const channel = supabase
      .channel("most-commented-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "confession_comments" },
        () => fetchMostCommented()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    }
  };

  const fetchMostCommented = async () => {
    const { data: confessionsData } = await supabase
      .from("confessions")
      .select(`
        *,
        confession_comments(count)
      `)
      .order("created_at", { ascending: false });

    if (confessionsData) {
      const sorted = confessionsData
        .map(c => ({
          ...c,
          commentCount: c.confession_comments?.[0]?.count || 0
        }))
        .filter(c => c.commentCount > 0)
        .sort((a, b) => b.commentCount - a.commentCount);

      setConfessions(sorted);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />

      <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold">Most Commented</h1>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground">
            Confessions with the most community engagement
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : confessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No comments yet. Be the first to comment on a confession!
            </div>
          ) : (
            confessions.map((confession) => (
              <div key={confession.id} className="relative">
                <div className="absolute -left-4 top-4 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                  {confession.commentCount}
                </div>
                <ConfessionCard confession={confession} isAdmin={isAdmin} />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MostCommented;
