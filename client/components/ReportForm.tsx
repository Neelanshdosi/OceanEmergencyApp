import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HazardType, MediaItem, Report, ReportInput } from "@shared/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const hazardOptions: { value: HazardType; label: string }[] = [
  { value: "tsunami", label: "Tsunami" },
  { value: "high_waves", label: "High Waves" },
  { value: "flooding", label: "Flooding" },
  { value: "rip_current", label: "Rip Current" },
  { value: "oil_spill", label: "Oil Spill" },
  { value: "debris", label: "Debris" },
  { value: "other", label: "Other" },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ReportForm: React.FC<{
  onSubmitted?: (report: Report) => void;
  pickLocation?: { lat: number; lng: number } | null;
}> = ({ onSubmitted, pickLocation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HazardType>("high_waves");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [media, setMedia] = useState<MediaItem[]>([]);
  const busy = useRef(false);

  // Auto geolocate on mount
  useEffect(() => {
    if (!coords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
      );
    }
  }, [coords]);

  // Allow map to set manual location
  useEffect(() => {
    if (pickLocation) setCoords(pickLocation);
  }, [pickLocation?.lat, pickLocation?.lng]);

  const canSubmit = useMemo(
    () => title.trim() && description.trim() && coords,
    [title, description, coords],
  );

  async function submit() {
    if (busy.current || !canSubmit) return;
    busy.current = true;
    const input: ReportInput = {
      title: title.trim(),
      description: description.trim(),
      type,
      latitude: coords!.lat,
      longitude: coords!.lng,
      timestamp: new Date().toISOString(),
      media,
    };

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user?.role ?? "citizen",
          "x-user-name": user?.name ?? "Anonymous",
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = (await res.json()) as Report;
      toast.success("Report submitted");
      onSubmitted?.(saved);
      setTitle("");
      setDescription("");
      setMedia([]);
    } catch (e) {
      // Offline queue
      const queue = JSON.parse(localStorage.getItem("offline:reports") || "[]");
      queue.push(input);
      localStorage.setItem("offline:reports", JSON.stringify(queue));
      toast.warning("Offline: saved locally. Sync later from Dashboard.");
    } finally {
      busy.current = false;
    }
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files) return;
    const items: MediaItem[] = [];
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const f = files[i];
      const dataUrl = await fileToDataUrl(f);
      items.push({
        id: crypto.randomUUID(),
        kind: f.type.startsWith("video") ? "video" : "image",
        dataUrl,
      });
    }
    setMedia(items);
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">Submit Hazard Report</h3>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., High waves near pier"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you observed"
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label>Event Type</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {hazardOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Media (photos/videos)</Label>
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => onFilesSelected(e.target.files)}
          />
          {media.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {media.map((m) =>
                m.kind === "image" ? (
                  <img
                    key={m.id}
                    src={m.dataUrl}
                    className="h-20 w-full rounded object-cover"
                  />
                ) : (
                  <video
                    key={m.id}
                    src={m.dataUrl}
                    className="h-20 w-full rounded object-cover"
                  />
                ),
              )}
            </div>
          )}
        </div>
        <div className="grid gap-1 text-sm">
          <div className="font-medium">Location</div>
          <div className="text-muted-foreground">
            {coords ? (
              <span>
                lat {coords.lat.toFixed(4)} · lng {coords.lng.toFixed(4)}
              </span>
            ) : (
              <span>Fetching your location… or tap the map</span>
            )}
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-ocean-600 to-teal-500"
          disabled={!canSubmit}
          onClick={submit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
