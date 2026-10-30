import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";
import {
  JobMatcherError,
  matchResumeToJob,
} from "../services/jobMatcher.service.js";

const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export const matchJobDescription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authRequest = req as AuthenticatedRequest;

  try {
    if (!authRequest.user) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const resume = req.file;
    const { jobDescription } = req.body as {
      jobDescription?: unknown;
    };

    if (!resume) {
      res.status(400).json({
        message: "Please upload your resume as a PDF.",
      });
      return;
    }

    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      res.status(400).json({
        message: "Please paste the job description.",
      });
      return;
    }

    const trimmedJobDescription = jobDescription.trim();

    if (trimmedJobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      res.status(400).json({
        message: `The job description must not exceed ${MAX_JOB_DESCRIPTION_LENGTH} characters.`,
      });
      return;
    }

    const pdfBase64 = resume.buffer.toString("base64");

    const result = await matchResumeToJob(pdfBase64, trimmedJobDescription);

    res.status(200).json({
      message: "Resume matched with the job description successfully.",
      result,
    });
  } catch (error: unknown) {
    if (error instanceof JobMatcherError) {
      res.status(error.statusCode).json({
        message: error.message,
      });
      return;
    }

    next(error);
  }
};
