import type { NextFunction, Request, Response } from "express";
import {
  MAX_JOB_DESCRIPTION_LENGTH,
  MIN_JOB_DESCRIPTION_LENGTH,
} from "../config/limits.js";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";
import { matchResumeToJob } from "../services/jobMatcher.service.js";
import { runWithAiQuota } from "../utils/ai-quota.js";
import { HttpError } from "../utils/http-error.js";

export const matchJobDescription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  const resume = req.file;

  const { jobDescription } = (req.body ?? {}) as {
    jobDescription?: unknown;
  };

  try {
    if (!user) {
      throw new HttpError("Authentication required.", 401);
    }

    if (!resume) {
      throw new HttpError("Please upload your resume as a PDF.", 400);
    }

    if (typeof jobDescription !== "string") {
      throw new HttpError("Please paste the job description.", 400);
    }

    const text = jobDescription.trim();

    if (text.length < MIN_JOB_DESCRIPTION_LENGTH) {
      throw new HttpError(
        `The job description is too short. Paste the full posting (at least ${MIN_JOB_DESCRIPTION_LENGTH} characters).`,
        400,
      );
    }

    if (text.length > MAX_JOB_DESCRIPTION_LENGTH) {
      throw new HttpError(
        `The job description must not exceed ${MAX_JOB_DESCRIPTION_LENGTH} characters.`,
        400,
      );
    }

    // A failed AI call gives the free request back.
    const result = await runWithAiQuota(user.id, () =>
      matchResumeToJob(resume.buffer, text),
    );

    res.status(200).json({
      message: "Resume matched with the job description successfully.",
      result,
    });
  } catch (error: unknown) {
    next(error);
  }
};
