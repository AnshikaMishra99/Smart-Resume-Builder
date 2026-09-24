import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables immediately before module dependencies run
dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import errorHandler from "./middleware/errorHandler.js";

// Connect to MongoDB
connectDB();

const app = express();

// ----- Middleware -----
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:3000",
      ].filter(Boolean);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.CLIENT_URL === "*"
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive CORS for smooth deployment
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

// ----- Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/ai", aiRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Smart AI Resume Builder API is running ✅" });
});

// ----- Error Handler (must be last) -----
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
