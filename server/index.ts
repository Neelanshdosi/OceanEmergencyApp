import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  createReport,
  listReports,
  seedReports,
  verifyReport,
} from "./routes/reports";
import { listSocial } from "./routes/social";
import {
  searchTweets,
  searchOceanEmergencyTweets,
  getOceanEmergencySocialFeed,
  postTweet,
  getUserByUsername,
  getTrendingTopics,
  getTweetsByHashtags,
} from "./routes/twitter";
import { testTwitterIntegration } from "./routes/twitter-test";
import {
  register,
  login,
  googleAuth,
  getProfile,
  updateProfile,
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "6mb" }));
  app.use(express.urlencoded({ extended: true, limit: "6mb" }));

  // Seed sample data
  seedReports().catch(console.error);

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/google", googleAuth);
  app.get("/api/auth/profile", getProfile);
  app.put("/api/auth/profile", updateProfile);

  // Reports
  app.get("/api/reports", listReports);
  app.post("/api/reports", createReport);
  app.patch("/api/reports/:id/verify", verifyReport);

  // Social (simulated)
  app.get("/api/social", listSocial);

  // Twitter API routes
  app.get("/api/twitter/search", searchTweets);
  app.get("/api/twitter/ocean-emergency", searchOceanEmergencyTweets);
  app.get("/api/twitter/ocean-emergency/social", getOceanEmergencySocialFeed);
  app.post("/api/twitter/post", postTweet);
  app.get("/api/twitter/user/:username", getUserByUsername);
  app.get("/api/twitter/trending", getTrendingTopics);
  app.get("/api/twitter/hashtags", getTweetsByHashtags);
  app.get("/api/twitter/test", testTwitterIntegration);

  return app;
}
