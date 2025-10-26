import { ConfessionForm } from "@/components/ConfessionForm";
import { ConfessionList } from "@/components/ConfessionList";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    checkAdminStatus();
    fetchConfessions();
    
    const channel = supabase
      .channel("home-confessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "confessions" },
        () => fetchConfessions()
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

  const fetchConfessions = async () => {
    const { data } = await supabase
      .from("confessions")
      .select("*")
      .order("created_at", { ascending: false });
    
    setConfessions(data || []);
    extractPopularTags(data || []);
  };

  const extractPopularTags = (confessions: any[]) => {
    const tagRegex = /#(\w+)/g;
    const tagCounts: Record<string, number> = {};
    
    confessions.forEach(c => {
      const matches = c.content.matchAll(tagRegex);
      for (const match of matches) {
        const tag = match[1];
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });

    const sorted = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
    
    setPopularTags(sorted);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                  RAIT Confession
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 lg:mt-1">Share anonymously</p>
              </div>
              <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xl lg:text-2xl font-bold text-primary">{confessions.length}</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground whitespace-nowrap">Confessions</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-6">{/* ... keep existing code */}
                {/* Confession Form */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Share Your Confession</h2>
                    <ConfessionForm />
                  </CardContent>
                </Card>

                {/* Confession List */}
                <ConfessionList />
              </div>

              {/* Right Column - Sidebar Content */}
              <div className="space-y-4">
                {/* Share Your Story Card */}
                <Card className="bg-gradient-to-br from-secondary to-accent text-white border-0">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Share Your Story</h3>
                    <p className="text-sm text-white/90">
                      Have something on your mind? Share it anonymously with the RAIT community.
                    </p>
                  </CardContent>
                </Card>

                {/* Trending Now */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <span className="text-primary">📈</span> Trending Now
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No trending confessions yet<br />
                      Be the first to share!
                    </p>
                  </CardContent>
                </Card>

                {/* Popular Tags */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <span className="text-primary">#</span> Popular Tags
                    </h3>
                    {popularTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No popular tags yet<br />
                        Start using tags in your confessions!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map(tag => (
                          <span key={tag} className="tag-pill">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="font-semibold text-lg mb-2">RAIT Confession</h3>
            <p className="text-sm text-muted-foreground">
              An anonymous platform for RAIT students to share their thoughts, experiences, and feelings freely.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
