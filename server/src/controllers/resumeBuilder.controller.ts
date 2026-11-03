import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";
import {
  buildResumeFromDetails,
  improveExistingResume,
} from "../services/resumeBuilder.service.js";
import { runWithAiQuota } from "../utils/ai-quota.js";
import { HttpError } from "../utils/http-error.js";
import { validateManualResume } from "../validators/resumeBuilder.validator.js";

export const buildResume = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  const file = req.file;
  const mode: unknown = req.body?.mode;

  try {
    if (!user) {
      throw new HttpError("Authentication required.", 401);
    }

    if (mode === "manual") {
      if (file) {
        throw new HttpError(
          "Do not upload a PDF when building a resume from scratch.",
          400,
        );
      }

      const resumeData = validateManualResume(req.body?.resumeData);

      const result = await runWithAiQuota(user.id, () =>
        buildResumeFromDetails(resumeData),
      );

      res.status(200).json({
        message: "Resume generated successfully.",
        result,
      });
      return;
    }

    if (mode === "improve") {
      if (!file) {
        throw new HttpError("Please upload your existing resume PDF.", 400);
      }

      // The size limit is already enforced by the upload middleware.
      if (file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
        throw new HttpError("The uploaded file is not a valid PDF.", 400);
      }

      const result = await runWithAiQuota(user.id, () =>
        improveExistingResume(file.buffer),
      );

      res.status(200).json({
        message: "Resume improved successfully.",
        result,
      });
      return;
    }

    throw new HttpError("Please select a valid resume building mode.", 400);
  } catch (error: unknown) {
    next(error);
  }
};
