import mongoose from "mongoose";

/**
 * Education sub-schema: institution name, degree, dates, and GPA/percentage line.
 */
const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  duration: { type: String, required: true }, // e.g. "2023 - 2027"
  details: { type: String, default: "" }, // e.g. "SGPA: 6.47" or "Percentage: 77%"
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
 * Main Resume schema. Skills are stored as a flexible key-value object so
 * categories (Programming Languages, Web Development, Databases, etc.)
 * can be dynamically added/edited by the user.
 */
const resumeSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
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
      of: String, // e.g. { "Programming Languages": "Java, JavaScript, SQL" }
      default: {},
    },
    projects: [projectSchema],
    achievements: [{ type: String }],
    activities: [{ type: String }],
    color: { type: String, default: "#4F46E5" },
  },
  { timestamps: true }
);

import fs from "fs";
import path from "path";

const getFilePath = () => {
  return path.resolve("resumes.json");
};

const readData = () => {
  try {
    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read mock DB:", error);
    return [];
  }
};

const writeData = (data) => {
  try {
    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write mock DB:", error);
  }
};

const createMockInstance = (data) => {
  return {
    ...data,
    toObject() {
      return this;
    }
  };
};

const MockResume = {
  create: async (data) => {
    const list = readData();
    const newResume = {
      _id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newResume);
    writeData(list);
    return createMockInstance(newResume);
  },
  find: (query = {}) => {
    let list = readData();
    if (query && query.userId) {
      list = list.filter(r => r.userId === query.userId);
    } else if (query && Object.keys(query).length > 0) {
      list = list.filter(r => {
        return Object.entries(query).every(([k, v]) => r[k] === v);
      });
    }
    return {
      sort: (sortObj) => {
        const sorted = [...list].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return sorted.map(createMockInstance);
      }
    };
  },
  findById: async (id) => {
    const list = readData();
    const found = list.find(r => r._id === id);
    if (!found) return null;
    return createMockInstance(found);
  },
  findByIdAndUpdate: async (id, data, options) => {
    const list = readData();
    const index = list.findIndex(r => r._id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    writeData(list);
    return createMockInstance(list[index]);
  },
  findByIdAndDelete: async (id) => {
    const list = readData();
    const found = list.find(r => r._id === id);
    if (!found) return null;
    const filtered = list.filter(r => r._id !== id);
    writeData(filtered);
    return createMockInstance(found);
  },
  deleteMany: async (query) => {
    writeData([]);
    return { deletedCount: 0 };
  }
};

const MongooseResume = mongoose.model("Resume", resumeSchema);

const Resume = new Proxy(MongooseResume, {
  get(target, prop) {
    const isConnected = mongoose.connection.readyState === 1;
    const source = isConnected ? target : MockResume;
    const value = Reflect.get(source, prop);
    if (typeof value === "function") {
      return value.bind(source);
    }
    return value;
  },
});

export default Resume;
