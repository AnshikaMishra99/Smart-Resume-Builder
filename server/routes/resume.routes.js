import express from "express";
import {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  downloadResumePDF,
} from "../controllers/resume.controller.js";

const router = express.Router();

router.post("/", createResume);
router.get("/", getResumes);
router.get("/:id", getResumeById);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
router.get("/:id/download", downloadResumePDF);

export default router;
