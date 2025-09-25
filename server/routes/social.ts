import { RequestHandler } from "express";
import { SocialPost, SocialResponse } from "@shared/api";

const hazardKeywords = [
  "tsunami",
  "earthquake",
  "quake",
  "flood",
  "flooding",
  "high waves",
  "rip current",
  "storm surge",
  "oil spill",
  "debris",
  "cyclone",
  "hurricane",
  "typhoon",
];

// Tiny sentiment lexicon for prototype
const positive = ["safe", "calm", "clear", "ok", "fine", "mild"];
const negative = [
  "danger",
  "scary",
  "bad",
  "worse",
  "worst",
  "hazard",
  "alert",
  "warning",
  "evacuate",
  "rough",
  "strong",
  "huge",
  "massive",
  "deadly",
];

function analyze(text: string) {
  const lower = text.toLowerCase();
  const keywords = hazardKeywords.filter((k) => lower.includes(k));
  let score = 0;
  for (const w of positive) if (lower.includes(w)) score += 1;
  for (const w of negative) if (lower.includes(w)) score -= 1;
  const sentiment: SocialPost["sentiment"] =
    score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
  return { keywords, sentiment };
}

// In-memory rotating sample (India-focused)
const samples = [
  "Huge waves reported near Chennai Marina, people advised to stay away from the shore",
  "Oil spill sighted off the coast of Goa, strong smell in nearby beaches",
  "Calm waters today at Kovalam despite yesterday's storm",
  "Rip current warning near Puri beach reported by locals",
  "Flooding reported in Mumbai's coastal road after high tide",
  "Tsunami alert tested — no casualties reported along Andaman and Nicobar islands",
];

export const listSocial: RequestHandler = (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const now = Date.now();
  const items: SocialPost[] = samples
    .map((text, i) => {
      const { keywords, sentiment } = analyze(text);
      return {
        id: `${now}-${i}`,
        platform: i % 2 === 0 ? "twitter" : "reddit",
        text,
        createdAt: new Date(now - i * 60_000).toISOString(),
        user: i % 2 === 0 ? "@coastwatch" : "u/seaScope",
        location: i % 3 === 0 ? { lat: 37.7749 + Math.random() * 0.1, lng: -122.4194 + Math.random() * 0.1 } : null,
        keywords,
        sentiment,
      } satisfies SocialPost;
    })
    .filter((p) => {
      if (!q) return true;
      // Support OR syntax and multiple keywords: split by OR, commas, semicolons or whitespace
      const tokens = q.split(/\s+(?:OR|or)\s+|[,;]+|\s+/).map(t => t.trim()).filter(Boolean);
      const lower = p.text.toLowerCase();
      // Match if any token is present in the post text
      return tokens.some(token => lower.includes(token.toLowerCase()));
    });

  const response: SocialResponse = { items };
  res.json(response);
};
