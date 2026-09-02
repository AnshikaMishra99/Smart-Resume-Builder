import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Resume from "./models/Resume.model.js";

dotenv.config();

/**
 * Seed data matching the reference resume image exactly,
 * with LinkedIn and GitHub added to personalInfo.
 * Replace the placeholder URLs with your actual profiles.
 */
const seedResume = {
  personalInfo: {
    name: "Anshika Mishra",
    location: "Greater Noida, Uttar Pradesh",
    phone: "7300728283",
    email: "anshikamishra9099@gmail.com",
    linkedin: "linkedin.com/in/anshika-mishra",
    github: "github.com/anshika-mishra",
  },
  objective:
    "Detail-oriented Computer Science student seeking an opportunity to leverage strong problem-solving skills, programming knowledge, and project experience to contribute effectively to a dynamic software development team.",
  education: [
    {
      institution: "G.L. Bajaj Institute of Technology and Management",
      degree: "B.Tech",
      duration: "2023 - 2027",
      details: "SGPA: 6.47",
    },
    {
      institution: "TRC Memorial Public School",
      degree: "Senior Secondary",
      duration: "2022",
      details: "77%",
    },
    {
      institution: "Uma Shankar Vidyapeeth",
      degree: "High School",
      duration: "2020",
      details: "94.9%",
    },
  ],
  skills: {
    "Programming Languages": "Java, JavaScript, SQL",
    "Web Development": "HTML, CSS, React",
    "Backend": "Node.js, Express.js",
    "Databases": "MongoDB, MySQL",
    "Concepts": "Data Structures and Algorithms (Object-Oriented Programming (OOP), DBMS, Full-Stack Development",
    "Tools": "Git, GitHub, VS Code",
    "Soft Skills": "Problem Solving, Teamwork, Communication",
  },
  projects: [
    {
      title: "Phishing Website Detector Extension",
      techStack: "JavaScript, Chrome Extension APIs, REST API Integration, JSON, Web Security Basics",
      bullets: [
        "Built a browser extension to detect phishing websites using URL heuristics, HTTPS/certificate validation, and blacklist APIs.",
        "Integrated Google Safe Browsing and PhishTank for real-time threat detection.",
        "Designed a user-friendly warning system to alert users before visiting malicious websites.",
      ],
    },
    {
      title: "CrowdFix - Smart Civic Issue Reporting System",
      techStack: "React, HTML, CSS, REST APIs, Basic System Design",
      bullets: [
        "Conceptualized a civic-tech solution for reporting and tracking public issues using photos, GPS, and AI-based categorization.",
        "Collaborated with the technical lead to explain system architecture and user flow through clear and structured presentations.",
        "Designed the project pitch deck and presented the problem, solution, and feasibility during evaluation.",
        "Focused on improving transparency, prioritization, and accountability in civic issue reporting.",
      ],
    },
  ],
  achievements: [
    "Solved 200 problems on LeetCode.",
    "Participated in Smart India Hackathon.",
    "Cleared certifications in Data Analytics and Cybersecurity Essentials.",
  ],
  activities: [
    "Presented the Phishing Website Detector Extension during a company visit, explaining the problem statement, detection approach, system workflow, and real-world cybersecurity impact.",
    "Participated in Smart India Hackathon (SIH), contributing to the development and presentation of CrowdFix, a smart civic issue reporting platform.",
  ],
};

/**
 * Connects to MongoDB, clears existing resumes (optional), and inserts
 * the seed resume. Run with: node seed.js
 */
const runSeed = async () => {
  await connectDB();

  try {
    // Optional: remove this line if you want to keep existing resumes
    await Resume.deleteMany({});

    const created = await Resume.create(seedResume);
    console.log("✅ Seed resume created with ID:", created._id.toString());
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runSeed();
