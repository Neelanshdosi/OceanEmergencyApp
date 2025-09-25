import React, { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/AuthDialog';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, LogOut, MapPin, ChevronDown } from 'lucide-react';
import { useMapContext } from '@/context/MapContext';
import ReportHazardModal from '@/components/ReportHazardModal';

export const Header: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { pathname } = useLocation();
  const { activeHazardsCount } = useMapContext();

  const [mapMenuOpen, setMapMenuOpen] = useState(false);
  const mapMenuRef = useRef<HTMLDivElement | null>(null);

  const isMapActive = pathname === '/map' || pathname.startsWith('/map');

  const [reportOpen, setReportOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur bg-background/70">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-ocean-500 to-teal-400" />
          <div>
            <Link to="/" className="font-extrabold tracking-tight text-ocean-800 dark:text-ocean-100">
              OceanWatch
            </Link>
            <div className="text-xs text-muted-foreground">Marine Safety Monitoring</div>
          </div>

          <nav className="ml-6 hidden gap-4 md:flex">
            <Link
              className={cn(
                'text-sm font-medium',
                pathname === '/' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              to="/"
            >
              Home
            </Link>
            <Link
              className={cn(
                'text-sm font-medium',
                pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              to="/dashboard"
            >
              Dashboard
            </Link>

            <div className={'relative'} ref={mapMenuRef}>
              <div className={cn('inline-flex items-center gap-2 rounded px-2 py-1 cursor-pointer select-none focus:outline-none', isMapActive ? 'bg-muted-foreground/10 underline decoration-2 decoration-transparent' : '')}>
                <Link
                  to="/map"
                  aria-label="Open Live Map"
                  className={cn(
                    'text-sm font-medium inline-flex items-center gap-2',
                    isMapActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Live Map</span>
                  {typeof activeHazardsCount === 'number' && (
                    <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-600 text-white">
                      {activeHazardsCount}
                    </span>
                  )}
                </Link>

                <button
                  aria-haspopup="true"
                  aria-expanded={mapMenuOpen}
                  aria-label="Live Map quick actions"
                  onClick={() => setMapMenuOpen((s) => !s)}
                  onBlur={() => setTimeout(() => setMapMenuOpen(false), 150)}
                  className="p-1"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {mapMenuOpen && (
                <div role="menu" className="absolute mt-2 right-0 w-44 rounded-md border bg-card p-2 shadow-lg z-50">
                  <Link to="/map?panel=filters" className="w-full block text-left px-2 py-1 text-sm hover:bg-muted-foreground/5 rounded">Filters</Link>
                  <Link to="/map?panel=subscribe" className="w-full block text-left px-2 py-1 text-sm hover:bg-muted-foreground/5 rounded">Subscribe to area</Link>
                  <Link to="/map?panel=draw" className="w-full block text-left px-2 py-1 text-sm hover:bg-muted-foreground/5 rounded">Draw geofence</Link>
                  <Link to="/map?panel=export" className="w-full block text-left px-2 py-1 text-sm hover:bg-muted-foreground/5 rounded">Export view</Link>
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <Link
                className={cn(
                  'text-sm font-medium',
                  pathname === '/admin' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                to="/admin"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => setReportOpen(true)}>
            Report Hazard
          </Button>

          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-500 text-white text-xs font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden flex-col sm:flex">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
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
      <ReportHazardModal open={reportOpen} onOpenChange={setReportOpen} />
    </header>
  );
};

export default Header;
