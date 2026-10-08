import express from "express";
import {
  handleResumeReview,
  handleSkillSuggestion,
  handleSummaryGeneration,
  handleAtsMatch,
} from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth protection to all AI endpoints
router.use(protect);

router.post("/review", handleResumeReview);
router.post("/suggest-skills", handleSkillSuggestion);
router.post("/generate-summary", handleSummaryGeneration);
router.post("/ats-match", handleAtsMatch);

export default router;
