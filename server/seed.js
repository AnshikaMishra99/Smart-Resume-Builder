import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.model.js";
import Resume from "./models/Resume.model.js";

dotenv.config();

/**
 * Sample resume data with anonymized/fake personal details.
 */
const sampleResumeData = {
  personalInfo: {
    name: "Alex Morgan",
    location: "San Francisco, CA",
    phone: "+1 (555) 019-2834",
    email: "alex.morgan@example.com",
    linkedin: "linkedin.com/in/alex-morgan-demo",
    github: "github.com/alex-morgan-demo",
  },
  objective:
    "Motivated and detail-oriented Computer Science student seeking to leverage strong problem-solving skills, programming knowledge, and full-stack project experience in a dynamic software engineering team.",
  education: [
    {
      institution: "State University of Technology",
      degree: "B.S. in Computer Science",
      duration: "2023 - 2027",
      details: "GPA: 3.8 / 4.0",
    },
    {
      institution: "Central High School",
      degree: "High School Diploma",
      duration: "2019 - 2023",
      details: "Valedictorian (95%)",
    },
  ],
  skills: {
    "Programming Languages": "JavaScript, Python, Java, SQL",
    "Web Development": "React, HTML5, CSS3, Tailwind CSS",
    "Backend & APIs": "Node.js, Express.js, RESTful APIs, JWT Auth",
    "Databases": "MongoDB, PostgreSQL",
    "Tools & Platforms": "Git, GitHub, Docker, Postman, VS Code",
    "Soft Skills": "Problem Solving, Communication, Team Collaboration",
  },
  projects: [
    {
      title: "Phishing Website Detector Extension",
      techStack: "JavaScript, Chrome Extension APIs, REST API Integration, Web Security",
      bullets: [
        "Built a browser extension to detect phishing websites using URL heuristics, HTTPS/certificate validation, and blacklist APIs.",
        "Integrated threat intelligence APIs for real-time URL classification and safety scoring.",
        "Designed a user-friendly modal warning system to alert users before visiting malicious web pages.",
      ],
    },
    {
      title: "Smart Civic Issue Reporting System",
      techStack: "React, Node.js, Express, MongoDB, Tailwind CSS",
      bullets: [
        "Developed a civic-tech web platform for reporting and tracking public infrastructure issues using photo uploads and geolocation.",
        "Implemented secure JWT authentication and role-based views for citizens and municipal administrators.",
        "Designed responsive REST endpoints and database schemas for issue ticket lifecycles.",
      ],
    },
  ],
  achievements: [
    "Solved 200+ algorithmic problems on LeetCode.",
    "First-place winner at Regional University Hackathon 2025.",
    "Certified AWS Certified Cloud Practitioner.",
  ],
  activities: [
    "Tech Lead at University Open Source Developer Club.",
    "Active contributor to community web accessibility projects.",
  ],
  color: "#4F46E5",
};

/**
 * Run Seed script:
 * Creates demo user (email: demo@example.com, password: demo123)
 * and attaches the sample resume to it.
 */
const runSeed = async () => {
  await connectDB();

  try {
    const demoEmail = "demo@example.com";
    const demoPassword = "demo123";

    // Delete existing demo user if present to ensure clean seed
    await User.deleteMany({ email: demoEmail });

    const hashedPassword = await bcrypt.hash(demoPassword, 10);
    const demoUser = await User.create({
      name: "Demo User",
      email: demoEmail,
      password: hashedPassword,
    });

    console.log(`✅ Demo User created: ${demoUser.email} (Password: ${demoPassword})`);

    // Delete existing resumes for demo user
    await Resume.deleteMany({ user: demoUser._id });

    const createdResume = await Resume.create({
      ...sampleResumeData,
      user: demoUser._id,
    });

    console.log("✅ Seed resume created with ID:", createdResume._id.toString());
    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runSeed();
