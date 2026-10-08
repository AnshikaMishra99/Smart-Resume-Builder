import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

/**
 * Establishes connection to MongoDB using the URI from environment variables.
 * Configures fallback DNS servers (8.8.8.8 / 1.1.1.1) to ensure SRV record resolution
 * works seamlessly on Windows systems.
 * Exits process with code 1 if connection fails.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    // Ensure reliable DNS resolution for mongodb+srv connections
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (dnsErr) {
      // Ignore if environment overrides DNS settings
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
