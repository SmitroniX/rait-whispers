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
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl lg:text-2xl font-bold">RAIT Confession</h1>
            <p className="text-xs lg:text-sm text-muted-foreground">Anonymous confessions platform</p>
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
                    <p className="text-sm text-muted-foreground">
                      No popular tags yet<br />
                      Start using tags in your confessions!
                    </p>
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
