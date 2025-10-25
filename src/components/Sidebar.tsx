import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SidebarProps {
  isAdmin: boolean;
}

export const Sidebar = ({ isAdmin }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/trending", icon: TrendingUp, label: "Trending" },
    { path: "/most-liked", icon: Heart, label: "Most Liked" },
  ];

  return (
    <aside className="w-64 p-6 bg-card border-r border-border sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          ))}
          
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant={isActive("/admin") ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <Shield className="w-5 h-5" />
                Admin
              </Button>
            </Link>
          )}

          <Link to="/auth">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 border-0"
            >
              Submit Confession
            </Button>
          </Link>
        </nav>

        {/* About Section */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-sm">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              RAIT Confession is an anonymous platform for students to share their thoughts, experiences, and feelings freely.
            </p>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-sm">Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be respectful and kind</li>
              <li>• No hate speech or bullying</li>
              <li>• Keep it college-related</li>
              <li>• Report inappropriate content</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};
