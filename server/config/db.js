import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Establishes connection to MongoDB using the URI from environment variables.
 * Falls back to local JSON database if connection fails.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log("🔄 Running with local JSON database fallback (resumes.json / users.json).");
  }
};

export default connectDB;
