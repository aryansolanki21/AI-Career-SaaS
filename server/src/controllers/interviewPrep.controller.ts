import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";
import { generateInterviewQuestions } from "../services/interviewPrep.service.js";
import { validateInterviewPrepRequest } from "../validators/interviewPrep.validator.js";
import { runWithAiQuota } from "../utils/ai-quota.js";
import { HttpError } from "../utils/http-error.js";

export const generateInterviewPrep = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;

    if (!user) {
      throw new HttpError("Authentication required.", 401);
    }

    const input = validateInterviewPrepRequest(req.body);

    const result = await runWithAiQuota(user.id, () =>
      generateInterviewQuestions(input),
    );

    res.status(200).json({
      message: "Interview questions generated successfully.",
      result,
    });
  } catch (error: unknown) {
    next(error);
  }
};
