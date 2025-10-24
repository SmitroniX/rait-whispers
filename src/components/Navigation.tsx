import { Link, useLocation } from "react-router-dom";
import { Lock, Home, TrendingUp, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus();
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RAIT Confession
              </h1>
              <p className="text-xs text-muted-foreground">Anonymous & Safe</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link to="/">
              <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/trending">
              <Button variant={isActive("/trending") ? "default" : "ghost"} size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
            </Link>
            <Link to="/most-liked">
              <Button variant={isActive("/most-liked") ? "default" : "ghost"} size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Most Liked
              </Button>
            </Link>
            
            {isAdmin && (
              <Link to="/admin">
                <Button variant={isActive("/admin") ? "default" : "ghost"} size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}

            {user ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Admin Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
