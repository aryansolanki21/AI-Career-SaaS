import type { Request, Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";
import { analyseResumeWithAi } from "../services/resumeAnalysis.service.js";
import { runWithAiQuota } from "../utils/ai-quota.js";
import { HttpError } from "../utils/http-error.js";

const MAX_PDF_SIZE = 5 * 1024 * 1024;

const MAX_BASE64_LENGTH = Math.ceil(MAX_PDF_SIZE / 3) * 4 + 4;

const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export const analyseResume = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authRequest = req as AuthenticatedRequest;

    if (!authRequest.user) {
      throw new HttpError("Authentication required.", 401);
    }

    const { pdfBase64, jobDescription } = req.body as {
      pdfBase64?: unknown;
      jobDescription?: unknown;
    };

    if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
      throw new HttpError("Please upload a PDF resume.", 400);
    }

    if (jobDescription !== undefined && typeof jobDescription !== "string") {
      throw new HttpError("The job description must be text.", 400);
    }

    const trimmedJobDescription = (jobDescription ?? "").trim();

    if (trimmedJobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      throw new HttpError(
        `The job description must not exceed ${MAX_JOB_DESCRIPTION_LENGTH} characters.`,
        400,
      );
    }

    const normalizedBase64 = pdfBase64.replace(
      /^data:application\/pdf;base64,/i,
      "",
    );

    if (normalizedBase64.length > MAX_BASE64_LENGTH) {
      throw new HttpError("The PDF must not exceed 5 MB.", 413);
    }

    if (
      normalizedBase64.length === 0 ||
      normalizedBase64.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(normalizedBase64)
    ) {
      throw new HttpError("The uploaded PDF data is invalid.", 400);
    }

    const pdfBuffer = Buffer.from(normalizedBase64, "base64");

    if (pdfBuffer.length === 0) {
      throw new HttpError("The uploaded PDF is empty.", 400);
    }

    if (pdfBuffer.length > MAX_PDF_SIZE) {
      throw new HttpError("The PDF must not exceed 5 MB.", 413);
    }

    if (pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new HttpError("The uploaded file is not a valid PDF.", 400);
    }

    const analysis = await runWithAiQuota(authRequest.user.id, () =>
      analyseResumeWithAi(normalizedBase64, trimmedJobDescription || undefined),
    );

    res.status(200).json({
      message: "Resume analysed successfully.",
      analysis,
    });
  } catch (error: unknown) {
    next(error);
  }
};
