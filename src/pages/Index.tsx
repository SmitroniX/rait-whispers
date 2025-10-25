import { ConfessionForm } from "@/components/ConfessionForm";
import { ConfessionList } from "@/components/ConfessionList";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
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

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      
      <main className="flex-1 p-8 max-w-5xl mx-auto">
        {/* Main Confession Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Share Your Confession</h2>
            <ConfessionForm />
          </CardContent>
        </Card>

        {/* Right Sidebar Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConfessionList />
          </div>
          
          <div className="space-y-6">
            {/* Share Your Story Card */}
            <Card className="bg-gradient-to-br from-secondary to-accent text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Share Your Story</h3>
                <p className="text-sm mb-4 text-white/90">
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
                <p className="text-sm text-muted-foreground">
                  No popular tags yet<br />
                  Start using tags in your confessions!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card py-6 mt-16">
        <div className="container mx-auto px-8 text-center">
          <h3 className="font-semibold text-lg mb-2">RAIT Confession</h3>
          <p className="text-sm text-muted-foreground">
            An anonymous platform for RAIT students to share their thoughts, experiences, and feelings freely.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
