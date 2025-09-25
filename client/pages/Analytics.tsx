import React, { useEffect, useState } from "react";
import MetricCard from "@/components/ui/MetricCard";
import { sampleReports } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

const Analytics: React.FC = () => {
  const [reports] = useState(sampleReports);

  // TODO: Replace with real data fetched from API
  useEffect(() => {
    // fetch('/api/reports')...
  }, []);

  const totalReports = reports.length;
  const activeReports = reports.filter((r) => !r.verified).length;
  const resolvedReports = reports.filter((r) => r.verified).length;
  const avgResponse = "12m";

  return (
    <div className="min-h-[80vh]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Visualize trends and response metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Total Reports" value={totalReports} />
        <MetricCard title="Active Reports" value={activeReports} />
        <MetricCard title="Resolved Reports" value={resolvedReports} />
        <MetricCard title="Avg Response Time" value={avgResponse} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Reports Over Time</h3>
          {/* LineChart component placeholder - will display reports count per time interval */}
          <div className="h-56 w-full rounded border border-dashed flex items-center justify-center text-muted-foreground">
            LineChart Placeholder
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Top Report Locations</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">San Francisco</div>
                <div className="text-xs text-muted-foreground">12 reports</div>
              </div>
              <div className="text-sm text-muted-foreground">›</div>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Los Angeles</div>
                <div className="text-xs text-muted-foreground">8 reports</div>
              </div>
              <div className="text-sm text-muted-foreground">›</div>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Honolulu</div>
                <div className="text-xs text-muted-foreground">6 reports</div>
              </div>
              <div className="text-sm text-muted-foreground">›</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Reports by Hazard Type</h3>
          {/* PieChart placeholder */}
          <div className="h-48 w-full rounded border border-dashed flex items-center justify-center text-muted-foreground">
            PieChart Placeholder
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Reports by Severity</h3>
          {/* BarChart placeholder */}
          <div className="h-48 w-full rounded border border-dashed flex items-center justify-center text-muted-foreground">
            BarChart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
