import { Router } from "express";
import { matchJobDescription } from "../controllers/jobMatcher.controller.js";
import { isAuth } from "../middlewares/auth-middleware.js";
import uploadResume from "../middlewares/upload-resume.js";

const router = Router();

router.post(
  "/job-matcher",
  isAuth,
  uploadResume.single("resume"),
  matchJobDescription,
);

export default router;
