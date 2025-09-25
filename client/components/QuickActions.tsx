import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, Phone, Plus } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const items = [
    { icon: <Plus className="h-4 w-4" />, label: 'Report New Hazard', href: '#' },
    { icon: <MapPin className="h-4 w-4" />, label: 'View Live Map', href: '/map' },
    { icon: <Phone className="h-4 w-4" />, label: 'Emergency Call', href: '#' },
    { icon: <FileText className="h-4 w-4" />, label: 'Export Reports', href: '#' },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-lg font-semibold">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <a key={it.label} href={it.href} className="flex items-center justify-between rounded px-3 py-2 hover:bg-muted-foreground/5">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-muted-foreground/5 p-2">{it.icon}</div>
              <div className="text-sm font-medium">{it.label}</div>
            </div>
            <div className="text-xs text-muted-foreground">›</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
