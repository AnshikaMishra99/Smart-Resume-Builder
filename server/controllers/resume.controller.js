import Resume from "../models/Resume.model.js";
import { generateResumePDF } from "../utils/pdfGenerator.js";

/**
 * @desc    Create a new resume for the logged-in user
 * @route   POST /api/resumes
 * @access  Private
 */
export const createResume = async (req, res, next) => {
  try {
    const resumeData = {
      ...req.body,
      user: req.user._id,
    };
    const resume = await Resume.create(resumeData);
    return res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resumes belonging to logged-in user
 * @route   GET /api/resumes
 * @access  Private
 */
export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(resumes);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single resume by ID (user owned)
 * @route   GET /api/resumes/:id
 * @access  Private
 */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    return res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing resume (user owned)
 * @route   PUT /api/resumes/:id
 * @access  Private
 */
export const updateResume = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    delete updateData.user;

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate and download a resume as PDF (user owned)
 * @route   GET /api/resumes/:id/download
 * @access  Private
 */
export const downloadResumePDF = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
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

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a resume (user owned)
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    next(error);
  }
};
