import { RequestHandler } from "express";
import {
  Report,
  ReportInput,
  ReportsQuery,
  ReportsResponse,
  UserRole,
} from "@shared/api";
import { firestoreService } from "../services/firestore";

// Helper to parse query safely
function parseQuery(q: any): ReportsQuery {
  const out: ReportsQuery = {};
  if (q.type) out.type = q.type;
  if (q.source) out.source = q.source;
  if (q.verified) out.verified = q.verified;
  if (q.from) out.from = q.from;
  if (q.to) out.to = q.to;
  if (q.bbox) out.bbox = q.bbox;
  return out;
}

export const listReports: RequestHandler = async (req, res) => {
  try {
    const q = parseQuery(req.query);
    const items = await firestoreService.getReports(q);
    const response: ReportsResponse = { items };
    res.json(response);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const createReport: RequestHandler = async (req, res) => {
  try {
    const input = req.body as ReportInput;
    if (!input || typeof input !== "object")
      return res.status(400).json({ error: "Invalid body" });
    if (
      !input.title ||
      !input.description ||
      !input.type ||
      typeof input.latitude !== "number" ||
      typeof input.longitude !== "number"
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Basic media validation (limit size by length of dataUrl)
    const media = (input.media ?? []).slice(0, 3).filter((m) => {
      return (
        m &&
        (m.kind === "image" || m.kind === "video") &&
        typeof m.dataUrl === "string" &&
        m.dataUrl.length <= 2_000_000 // ~2MB limit per item for prototype
      );
    });

    const userRole =
      (req.header("x-user-role") as UserRole | undefined) ?? "citizen";
    const userName = req.header("x-user-name") ?? "Anonymous";

    const report = await firestoreService.createReport(
      { ...input, media },
      userRole,
      userName
    );

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

export const verifyReport: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const role = req.header("x-user-role");
    if (role !== "analyst") return res.status(403).json({ error: "Forbidden" });

    const report = await firestoreService.verifyReport(id);
    if (!report) return res.status(404).json({ error: "Not found" });

    res.json(report);
  } catch (error) {
    console.error('Error verifying report:', error);
    res.status(500).json({ error: 'Failed to verify report' });
  }
};

export const seedReports = async () => {
  try {
    await firestoreService.seedReports();
  } catch (error) {
    console.error('Error seeding reports:', error);
  }
};
