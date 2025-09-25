import { useEffect, useMemo, useState } from "react";
import type { Report, SocialMediaPin } from "@shared/api";
import { MapView } from "@/components/MapView";
import { Filters, FiltersPanel } from "@/components/FiltersPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [socialPins, setSocialPins] = useState<SocialMediaPin[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    source: "all",
    verified: "all",
  });

  async function load() {
    const params = new URLSearchParams();
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.source !== "all") params.set("source", filters.source);
    if (filters.verified !== "all") params.set("verified", filters.verified);
    const res = await fetch(`/api/reports?${params.toString()}`);
    const json = await res.json();
    setReports(json.items as Report[]);
  }

  async function loadSocialPins() {
    try {
      const res = await fetch('/api/social');
      const json = await res.json();
      // Convert social posts to pins for the map
      const pins: SocialMediaPin[] = json.items
        .filter((post: any) => post.location)
        .map((post: any) => ({
          id: post.id,
          platform: post.platform,
          text: post.text,
          location: post.location,
          createdAt: post.createdAt,
          user: post.user || `@${post.platform}_user`,
          sentiment: post.sentiment,
          keywords: post.keywords || [],
        }));
      setSocialPins(pins);
    } catch (error) {
      console.error('Error loading social pins:', error);
    }
  }

  useEffect(() => {
    load();
    loadSocialPins();
  }, [filters.type, filters.source, filters.verified]);

  async function verify(id: string) {
    if (!user || user.role !== "analyst")
      return alert("Only analysts can verify");
    const res = await fetch(`/api/reports/${id}/verify`, {
      method: "PATCH",
      headers: { "x-user-role": user.role },
    });
    if (res.ok) load();
  }

  const center = useMemo<[number, number]>(() => [20, 0], []);

  return (
    <main className="container grid min-h-[calc(100vh-56px)] grid-cols-1 gap-4 py-4 md:grid-cols-5">
      <aside className="md:col-span-2 space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-ocean-600 to-teal-500 p-5 text-white shadow-lg">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Analyst Dashboard
          </h1>
          <p className="mt-1 text-sm opacity-90">
            View, filter, and verify reports.{" "}
            {user
              ? `Signed in as ${user.name} (${user.role})`
              : "Sign in to verify."}
          </p>
        </div>
        <FiltersPanel initial={filters} onChange={setFilters} />
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-lg font-semibold">Recent Reports</h3>
          <div className="space-y-2">
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-2 rounded-lg border p-2"
              >
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.type} • {new Date(r.timestamp).toLocaleString()} •{" "}
                    {r.source}
                  </div>
                  <p className="text-sm mt-1 max-w-[40ch]">{r.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${r.verified ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200"}`}
                  >
                    {r.verified ? "Verified" : "Unverified"}
                  </span>
                  {!r.verified && (
                    <Button
                      size="sm"
                      onClick={() => verify(r.id)}
                      disabled={!user || user.role !== "analyst"}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <section className="md:col-span-3 rounded-xl border p-0">
        <div className="flex items-center justify-between p-3">
          <div>
            <h3 className="text-lg font-semibold">Map & Hotspots</h3>
            <p className="text-xs text-muted-foreground">
              Use filters to refine. Click markers for details.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            Refresh
          </Button>
        </div>
        <div className="h-[70vh] w-full">
          <MapView reports={reports} socialPins={socialPins} center={center} />
        </div>
      </section>
    </main>
  );
}
