import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { HttpError } from "../utils/http-error.js";

const isBodyTooLarge = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "type" in error &&
  error.type === "entity.too.large";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    if (error.statusCode >= 500) {
      console.error("Request error:", error);
    }

    res.status(error.statusCode).json({
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
    });

    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        message: "The PDF must not exceed 5 MB.",
      });

      return;
    }

    res.status(400).json({
      message: "Upload a single PDF in the 'resume' field.",
    });

    return;
  }

  if (isBodyTooLarge(error)) {
    res.status(413).json({
      message: "The request is too large. Please upload a PDF under 5 MB.",
    });

    return;
  }

  console.error("Unhandled request error:", error);

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
};
