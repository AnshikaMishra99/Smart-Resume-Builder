import express from "express";
import {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  downloadResumePDF,
} from "../controllers/resume.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth protection to resume endpoints
router.use(protect);

router.post("/", createResume);
router.get("/", getResumes);
router.get("/:id", getResumeById);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
router.get("/:id/download", downloadResumePDF);

export default router;
