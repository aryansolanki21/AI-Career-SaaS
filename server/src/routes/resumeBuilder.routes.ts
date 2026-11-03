import { Router } from "express";
import { buildResume } from "../controllers/resumeBuilder.controller.js";
import { isAuth } from "../middlewares/auth-middleware.js";
import uploadResume from "../middlewares/upload-resume.js";

const router = Router();

router.post(
  "/resume-builder",
  isAuth,
  uploadResume.single("resume"),
  buildResume,
);

export default router;
