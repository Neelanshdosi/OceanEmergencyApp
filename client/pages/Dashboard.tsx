import type { Report, SocialMediaPin } from "@shared/api";
import type { Report, SocialMediaPin } from "@shared/api";
import React, { useEffect, useState, useMemo } from "react";
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
    try {
      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();
      setReports(json.items as Report[]);
    } catch (e) {
      setReports([]);
    }
  }

  async function loadSocialPins() {
    try {
      const res = await fetch("/api/social");
      const json = await res.json();
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
      console.error("Error loading social pins:", error);
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

  const safeReports = reports ?? [];
  const total = safeReports.length;
  const active = safeReports.filter((r) => !r.verified).length;
  const resolved = safeReports.filter((r) => r.verified).length;

  return (
    <main className="container min-h-[calc(100vh-56px)] py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of recent hazards and actions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Reports</div>
          <div className="mt-1 text-2xl font-semibold">{total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Active Alerts</div>
          <div className="mt-1 text-2xl font-semibold">{active}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="mt-1 text-2xl font-semibold">{resolved}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Avg Response</div>
          <div className="mt-1 text-2xl font-semibold">12m</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-lg font-semibold">Recent Alerts</h3>
            <div className="space-y-2">
              {safeReports.map((r) => (
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
        </div>

        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-lg font-semibold">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-muted-foreground/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted-foreground/5 p-2">+</div>
                  <div className="text-sm font-medium">Report New Hazard</div>
                </div>
                <div className="text-xs text-muted-foreground">›</div>
              </a>
              <a
                href="/map"
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-muted-foreground/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted-foreground/5 p-2">📍</div>
                  <div className="text-sm font-medium">View Live Map</div>
                </div>
                <div className="text-xs text-muted-foreground">›</div>
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-muted-foreground/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted-foreground/5 p-2">📞</div>
                  <div className="text-sm font-medium">Emergency Call</div>
                </div>
                <div className="text-xs text-muted-foreground">›</div>
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded px-3 py-2 hover:bg-muted-foreground/5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted-foreground/5 p-2">⬇️</div>
                  <div className="text-sm font-medium">Export Reports</div>
                </div>
                <div className="text-xs text-muted-foreground">›</div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border">
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
        <div className="h-[60vh] w-full">
          <MapView reports={reports} socialPins={socialPins} center={center} />
        </div>
      </div>
    </main>
  );
}
