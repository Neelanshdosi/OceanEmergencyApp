import { useEffect, useMemo, useState } from "react";
import React, { useEffect, useState, useMemo } from 'react';
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
    return [20, 0];
  }, []);

  async function loadReports() {
    const res = await fetch('/api/reports');
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
    <main className="container grid min-h-[calc(100vh-56px)] grid-cols-1 gap-8 py-8">
      {/* Hero */}
      <section className="mx-auto w-full max-w-4xl rounded-lg bg-card p-8 text-center">
        <h1 className="text-3xl font-extrabold">
          Monitor Ocean Safety in <span className="text-cyan-500">Real-Time</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl mx-auto">
          OceanWatch helps communities and analysts monitor coastal hazards — live mapping, crowd-sourced
          reports, and analytics to keep people safe.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/dashboard" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white">Start Monitoring</a>
          <a href="#features" className="inline-flex items-center rounded-md border px-4 py-2 text-sm">Learn More</a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl">
        <h2 className="mb-4 text-center text-2xl font-semibold">Comprehensive Ocean Monitoring</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-md bg-ocean-100 text-ocean-600 flex items-center justify-center">🗺️</div>
            <div className="font-semibold">Live Mapping</div>
            <div className="mt-2 text-sm text-muted-foreground">Real-time markers and hotspot layers.</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-md bg-ocean-100 text-ocean-600 flex items-center justify-center">📊</div>
            <div className="font-semibold">Analytics</div>
            <div className="mt-2 text-sm text-muted-foreground">Trends, charts, and response metrics.</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-md bg-ocean-100 text-ocean-600 flex items-center justify-center">🚩</div>
            <div className="font-semibold">Hazard Reporting</div>
            <div className="mt-2 text-sm text-muted-foreground">Quickly file and verify reports.</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-md bg-ocean-100 text-ocean-600 flex items-center justify-center">🛡��</div>
            <div className="font-semibold">Safety First</div>
            <div className="mt-2 text-sm text-muted-foreground">Guidance and emergency workflows.</div>
          </div>
        </div>
      </section>

      {/* Main two-column section with form + map */}
      <section className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border p-4">
            <h3 className="text-lg font-semibold">Submit Hazard</h3>
            <p className="text-xs text-muted-foreground">Share location and details to help responders.</p>
            <div className="mt-3">
              <ReportForm onSubmitted={onSubmitted} pickLocation={pick} />
            </div>
          </div>

          <SocialFeed />
        </div>

        <div className="md:col-span-2 rounded-xl border">
          <div className="flex items-center justify-between p-3">
            <div>
              <h3 className="text-lg font-semibold">Live Map</h3>
              <p className="text-xs text-muted-foreground">Markers show reports. Heat layer highlights hotspots.</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadReports}>Refresh</Button>
          </div>
          <div className="h-[60vh] w-full">
            <MapView reports={reports} center={center} onMapClick={(lat, lng) => setPick({ lat, lng })} />
          </div>
        </div>
      </section>
    </main>
  );
}

function OfflineSync({ onSynced }: { onSynced: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const q = JSON.parse(localStorage.getItem('offline:reports') || '[]');
    setCount(q.length);
  }, []);
  if (!count) return null;
  const sync = async () => {
    const q: any[] = JSON.parse(localStorage.getItem('offline:reports') || '[]');
    const ok: any[] = [];
    for (const input of q) {
      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (res.ok) ok.push(await res.json());
      } catch {}
    }
    localStorage.removeItem('offline:reports');
    onSynced();
  };
  return (
    <button onClick={sync} className="rounded-md border px-2 py-1">
      Sync {count} offline {count > 1 ? 'reports' : 'report'}
    </button>
  );
}
