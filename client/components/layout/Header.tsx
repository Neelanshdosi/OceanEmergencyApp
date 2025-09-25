import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, LogOut } from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur bg-background/70">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-ocean-500 to-teal-400" />
          <Link
            to="/"
            className="font-extrabold tracking-tight text-ocean-800 dark:text-ocean-100"
          >
            BlueWatch
          </Link>
          <nav className="ml-6 hidden gap-4 md:flex">
            <Link
              className={cn(
                "text-sm font-medium",
                pathname === "/"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              to="/"
            >
              Home
            </Link>
            <Link
              className={cn(
                "text-sm font-medium",
                pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              to="/dashboard"
            >
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link
                className={cn(
                  "text-sm font-medium",
                  pathname === "/admin"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                to="/admin"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-white text-xs font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden flex-col sm:flex">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setAuthDialogOpen(true)}>
              <User className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  );
};
