import {
  reviewResume,
  suggestSkills,
  generateSummary,
} from "../services/gemini.service.js";
import { analyzeATS } from "../utils/atsAnalyzer.js";

/**
 * @desc    AI Resume Reviewer - analyzes resume data and returns feedback
 * @route   POST /api/ai/review
 * @body    { resumeData: {...full resume object} }
 */
export const handleResumeReview = async (req, res, next) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({ message: "resumeData is required" });
    }

    const feedback = await reviewResume(resumeData);
    res.status(200).json(feedback);
  } catch (error) {
    console.error("AI Review Error:", error.message);
    res.status(500).json({
      message: "Failed to generate AI review. Please try again.",
    });
  }
};

/**
 * @desc    AI Skill Suggester - suggests skills based on target job role
 * @route   POST /api/ai/suggest-skills
 * @body    { jobRole: "Frontend Developer" }
 */
export const handleSkillSuggestion = async (req, res, next) => {
  try {
    const { jobRole } = req.body;

    if (!jobRole || jobRole.trim() === "") {
      return res.status(400).json({ message: "jobRole is required" });
    }

    const suggestions = await suggestSkills(jobRole);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error("AI Skill Suggestion Error:", error.message);
    res.status(500).json({
      message: "Failed to generate skill suggestions. Please try again.",
    });
  }
};

/**
 * @desc    AI Summary Generator - generates a professional objective/summary
 * @route   POST /api/ai/generate-summary
 * @body    { jobProfile: "Full Stack Developer" }
 */
export const handleSummaryGeneration = async (req, res, next) => {
  try {
    const { jobProfile, skills } = req.body;

    if (!jobProfile || jobProfile.trim() === "") {
      return res.status(400).json({ message: "jobProfile is required" });
    }

    const result = await generateSummary(jobProfile, skills);
    res.status(200).json(result);
  } catch (error) {
    console.error("AI Summary Generation Error:", error.message);
    res.status(500).json({
      message: "Failed to generate summary. Please try again.",
    });
  }
};

/**
 * @desc    ATS Matcher - computes resume fit score and keyword analytics against JD
 * @route   POST /api/ai/ats-match
 * @body    { resumeData: {...}, jobDescription: "..." }
 */
export const handleAtsMatch = async (req, res, next) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData) {
      return res.status(400).json({ message: "resumeData is required" });
    }
    if (!jobDescription || jobDescription.trim() === "") {
      return res.status(400).json({ message: "jobDescription is required" });
    }

    const result = analyzeATS(resumeData, jobDescription);
    res.status(200).json(result);
  } catch (error) {
    console.error("ATS Match Error:", error.message);
    res.status(500).json({
      message: "Failed to run ATS match. Please try again.",
    });
  }
};
