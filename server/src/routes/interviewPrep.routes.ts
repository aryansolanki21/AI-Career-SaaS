import { Router } from "express";
import { generateInterviewPrep } from "../controllers/interviewPrep.controller.js";
import { isAuth } from "../middlewares/auth-middleware.js";

const router = Router();

router.post("/interview-prep", isAuth, generateInterviewPrep);

export default router;
