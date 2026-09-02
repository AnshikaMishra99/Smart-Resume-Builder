import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import connectDB from "./config/db.js";
import Resume from "./models/Resume.model.js";

dotenv.config();

const runImport = async () => {
  await connectDB();
  try {
    const filePath = path.resolve("resumes.json");
    if (!fs.existsSync(filePath)) {
      console.log("No resumes.json file found to import.");
      return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (data.length === 0) {
      console.log("resumes.json is empty.");
      return;
    }
    
    console.log("Migrating resumes to MongoDB Atlas...");
    
    // Clear existing resumes in Atlas to prevent duplicates
    await Resume.deleteMany({});
    for (const resume of data) {
      const oldId = resume._id;
      
      // Delete old ID so Mongoose creates a valid 24-character MongoDB ObjectId
      delete resume._id;

      // Provide a fallback email if it's missing or empty
      if (!resume.personalInfo?.email) {
        if (!resume.personalInfo) resume.personalInfo = {};
        resume.personalInfo.email = "anshikamishra9099@gmail.com";
      }
      
      // Also ensure skills map/object formatting is ready
      if (resume.skills && typeof resume.skills === "object") {
        const skillsMap = new Map(Object.entries(resume.skills));
        resume.skills = skillsMap;
      }
      
      const created = await Resume.create(resume);
      console.log(`✅ Migrated: ${resume.personalInfo?.name || "Untitled"} (${oldId} -> ${created._id})`);
    }
    console.log("🎉 All resumes successfully migrated to MongoDB Atlas!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runImport();
