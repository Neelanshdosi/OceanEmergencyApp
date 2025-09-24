import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HazardType } from "@shared/api";

export interface Filters {
  type: HazardType | "all";
  source: "citizen" | "social" | "official" | "all";
  verified: "true" | "false" | "all";
}

export const FiltersPanel: React.FC<{
  initial?: Partial<Filters>;
  onChange: (f: Filters) => void;
}> = ({ initial, onChange }) => {
  const [type, setType] = useState<Filters["type"]>(initial?.type ?? "all");
  const [source, setSource] = useState<Filters["source"]>(
    initial?.source ?? "all",
  );
  const [verified, setVerified] = useState<Filters["verified"]>(
    initial?.verified ?? "all",
  );

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-2 text-lg font-semibold">Filters</h3>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label>Event Type</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="tsunami">Tsunami</SelectItem>
              <SelectItem value="high_waves">High Waves</SelectItem>
              <SelectItem value="flooding">Flooding</SelectItem>
              <SelectItem value="rip_current">Rip Current</SelectItem>
              <SelectItem value="oil_spill">Oil Spill</SelectItem>
              <SelectItem value="debris">Debris</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Source</Label>
          <Select value={source} onValueChange={(v: any) => setSource(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="citizen">Citizen</SelectItem>
              <SelectItem value="official">Official</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Verified</Label>
          <Select value={verified} onValueChange={(v: any) => setVerified(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => onChange({ type, source, verified })}>
          Apply
        </Button>
      </div>
    </div>
  );
};
