import { useEffect, useMemo, useState } from "react";
import type { Report } from "@shared/api";
import { ReportForm } from "@/components/ReportForm";
import { MapView } from "@/components/MapView";
import { SocialFeed } from "@/components/SocialFeed";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);

  const center = useMemo<[number, number]>(() => {
    // Try to center near user location on first load
    return [20, 0];
  }, []);

  async function loadReports() {
    const res = await fetch("/api/reports");
    const json = await res.json();
    setReports(json.items as Report[]);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function onSubmitted(r: Report) {
    setReports((prev) => [r, ...prev]);
  }

  return (
    <main className="container grid min-h-[calc(100vh-56px)] grid-cols-1 gap-4 py-4 md:grid-cols-5">
      <section className="md:col-span-2 space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-ocean-600 to-teal-500 p-5 text-white shadow-lg">
          <h1 className="text-2xl font-extrabold tracking-tight">
            BlueWatch: Ocean Hazard Reports
          </h1>
          <p className="mt-1 text-sm opacity-90">
            Crowdsourced alerts for waves, flooding, rip currents and more.{" "}
            {user
              ? `Signed in as ${user.name} (${user.role})`
              : "Sign in to verify or submit."}
          </p>
        </div>
        <ReportForm onSubmitted={onSubmitted} pickLocation={pick} />
        <SocialFeed />
      </section>
      <section className="md:col-span-3 rounded-xl border p-0">
        <div className="flex items-center justify-between p-3">
          <div>
            <h3 className="text-lg font-semibold">Live Map</h3>
            <p className="text-xs text-muted-foreground">
              Markers show reports. Heat layer highlights hotspots.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadReports}>
            Refresh
          </Button>
        </div>
        <div className="h-[65vh] w-full">
          <MapView
            reports={reports}
            center={center}
            onMapClick={(lat, lng) => setPick({ lat, lng })}
          />
        </div>
        <div className="flex items-center justify-between p-3 text-xs text-muted-foreground">
          <span>
            Tap on the map to set a custom location before submitting.
          </span>
          <OfflineSync onSynced={loadReports} />
        </div>
      </section>
    </main>
  );
}

function OfflineSync({ onSynced }: { onSynced: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const q = JSON.parse(localStorage.getItem("offline:reports") || "[]");
    setCount(q.length);
  }, []);
  if (!count) return null;
  const sync = async () => {
    const q: any[] = JSON.parse(
      localStorage.getItem("offline:reports") || "[]",
    );
    const ok: any[] = [];
    for (const input of q) {
      try {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.ok) ok.push(await res.json());
      } catch {}
    }
    localStorage.removeItem("offline:reports");
    onSynced();
  };
  return (
    <button onClick={sync} className="rounded-md border px-2 py-1">
      Sync {count} offline {count > 1 ? "reports" : "report"}
    </button>
  );
}
