import mongoose from "mongoose";

/**
 * Education sub-schema: institution name, degree, dates, and GPA/percentage line.
 */
const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  duration: { type: String, required: true },
  details: { type: String, default: "" },
});

/**
 * Project sub-schema: title, tech stack line, and bullet points describing the work.
 */
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  techStack: { type: String, default: "" },
  bullets: [{ type: String }],
});

/**
 * Main Resume schema.
 * Tied directly to a User via ObjectId reference for ownership isolation.
 */
const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    personalInfo: {
      name: { type: String, required: true },
      location: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, required: true },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    objective: { type: String, default: "" },
    education: [educationSchema],
    skills: {
      type: Map,
      of: String,
      default: {},
    },
    projects: [projectSchema],
    achievements: [{ type: String }],
    activities: [{ type: String }],
    color: { type: String, default: "#4F46E5" },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
