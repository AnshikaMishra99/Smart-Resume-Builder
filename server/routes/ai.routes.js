import express from "express";
import {
  handleResumeReview,
  handleSkillSuggestion,
  handleSummaryGeneration,
  handleAtsMatch,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/review", handleResumeReview);
router.post("/suggest-skills", handleSkillSuggestion);
router.post("/generate-summary", handleSummaryGeneration);
router.post("/ats-match", handleAtsMatch);

export default router;
