import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Heart, Shield, Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  isAdmin: boolean;
}

const SidebarContent = ({ isAdmin }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/trending", icon: TrendingUp, label: "Trending" },
    { path: "/most-liked", icon: Heart, label: "Most Liked" },
    { path: "/most-commented", icon: MessageSquare, label: "Most Commented" },
  ];

  return (
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
  );
};

export const Sidebar = ({ isAdmin }: SidebarProps) => {
  return (
    <>
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="fixed top-3 left-3 z-50 lg:hidden bg-card/95 backdrop-blur-sm shadow-lg border-primary/20 hover:bg-primary/10"
          >
            <Menu className="h-5 w-5 text-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RAIT Confession
            </h2>
          </div>
          <SidebarContent isAdmin={isAdmin} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 p-6 bg-card border-r border-border sticky top-0 h-screen overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            RAIT Confession
          </h2>
        </div>
        <SidebarContent isAdmin={isAdmin} />
      </aside>
    </>
  );
};
