import React from 'react';
import type { Report } from '@shared/api';
import { Button } from '@/components/ui/button';

export const RecentAlertsList: React.FC<{ items: Report[]; onVerify?: (id: string) => void }> = ({ items, onVerify }) => {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-lg font-semibold">Recent Alerts</h3>
      <div className="space-y-2 max-h-64 overflow-auto">
        {items.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-2 rounded-lg border p-2">
            <div>
              <div className="text-sm font-medium">{r.title}</div>
              <div className="text-xs text-muted-foreground">
                {r.type} • {new Date(r.timestamp).toLocaleString()} • {r.source}
              </div>
              <p className="text-sm mt-1 max-w-[40ch]">{r.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded px-2 py-0.5 text-xs ${r.verified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200'}`}>
                {r.verified ? 'Verified' : 'Unverified'}
              </span>
              {!r.verified && onVerify && (
                <Button size="sm" onClick={() => onVerify(r.id)}>
                  Verify
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlertsList;
