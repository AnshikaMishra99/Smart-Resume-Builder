import Resume from "../models/Resume.model.js";
import { generateResumePDF } from "../utils/pdfGenerator.js";

/**
 * Helper to check if logged in user owns the resume
 */
const checkOwnership = (resume, userId) => {
  if (!resume) return false;
  if (!resume.userId) return true; // Legacy resumes without userId
  return resume.userId === userId;
};

/**
 * @desc    Create a new resume
 * @route   POST /api/resumes
 */
export const createResume = async (req, res, next) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user ? req.user.id : null,
    };
    const resume = await Resume.create(resumeData);
    res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's resumes
 * @route   GET /api/resumes
 */
export const getResumes = async (req, res, next) => {
  try {
    const query = req.user ? { userId: req.user.id } : {};
    const resumes = await Resume.find(query).sort({ createdAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single resume by ID
 * @route   GET /api/resumes/:id
 */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    if (req.user && !checkOwnership(resume, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to access this resume" });
    }
    res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing resume
 * @route   PUT /api/resumes/:id
 */
export const updateResume = async (req, res, next) => {
  try {
    const existing = await Resume.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Resume not found" });
    }
    if (req.user && !checkOwnership(existing, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to modify this resume" });
    }

    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate and download a resume as PDF
 * @route   GET /api/resumes/:id/download
 */
export const downloadResumePDF = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    if (req.user && !checkOwnership(resume, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to download this resume" });
    }

    const resumeData = typeof resume.toObject === "function" ? resume.toObject() : { ...resume };
    
    // Safely convert skills Map/Object to a plain object
    let skillsObj = {};
    if (resume.skills instanceof Map) {
      skillsObj = Object.fromEntries(resume.skills);
    } else if (resume.skills && typeof resume.skills === "object") {
      skillsObj = resume.skills;
    }
    resumeData.skills = skillsObj;

    const pdfBuffer = await generateResumePDF(resumeData);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${(resumeData.personalInfo?.name || "Resume").replace(
        /\s+/g,
        "_"
      )}_Resume.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 */
export const deleteResume = async (req, res, next) => {
  try {
    const existing = await Resume.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Resume not found" });
    }
    if (req.user && !checkOwnership(existing, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to delete this resume" });
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    next(error);
  }
};
