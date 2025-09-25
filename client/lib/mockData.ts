import type { Report } from "@shared/api";

export const sampleReports: Report[] = [
  {
    id: "r1",
    title: "High waves near pier",
    description: "Large waves reported near the main pier.",
    type: "high_waves",
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    media: [],
    source: "citizen",
    verified: false,
    user: { id: "u1", name: "Alice", role: "citizen" },
  },
  {
    id: "r2",
    title: "Debris sighting",
    description: "Floating debris observed near the shoreline.",
    type: "debris",
    latitude: 34.0195,
    longitude: -118.4912,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    media: [],
    source: "citizen",
    verified: true,
    user: { id: "u2", name: "Bob", role: "analyst" },
  },
  {
    id: "r3",
    title: "Rip current warning",
    description: "Strong pull in water reported by swimmers.",
    type: "rip_current",
    latitude: 21.3069,
    longitude: -157.8583,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    media: [],
    source: "citizen",
    verified: false,
    user: { id: "u3", name: "Carol", role: "citizen" },
  },
];

export default {};
