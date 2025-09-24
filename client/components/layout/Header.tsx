import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"citizen" | "analyst" | "admin">("citizen");
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
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name} · {user.role}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Login</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign in (prototype)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="analyst">
                          Official / Analyst
                        </SelectItem>
                        <SelectItem value="admin">
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (!name.trim()) return;
                      login(name.trim(), role);
                      setOpen(false);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
};
