import { Router } from "express";
import { analyseResume } from "../controllers/resumeAnalysis.controller.js";
import { isAuth } from "../middlewares/auth-middleware.js";

const router = Router();

router.post("/analyse", isAuth, analyseResume);

export default router;
