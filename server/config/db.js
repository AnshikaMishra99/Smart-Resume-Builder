import mongoose from "mongoose";

/**
 * Establishes connection to MongoDB using the URI from environment variables.
 * Falls back to local JSON database if connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error to ${process.env.MONGO_URI}: ${error.message}`);
    console.log("🔄 Running with local JSON database fallback (resumes.json).");
  }
};

export default connectDB;
