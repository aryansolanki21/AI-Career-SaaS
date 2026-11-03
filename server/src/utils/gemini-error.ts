import { HttpError } from "./http-error.js";

const getStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  return undefined;
};

export const toAiServiceError = (error: unknown): HttpError => {
  const status = getStatus(error);

  if (status === 429) {
    return new HttpError(
      "The Gemini API rate limit or quota has been exceeded. Please try again later.",
      429,
    );
  }

  if (status === 503) {
    return new HttpError(
      "The Gemini service is temporarily unavailable. Please try again shortly.",
      503,
    );
  }

  return new HttpError(
    "The AI service could not complete your request. Please try again later.",
    502,
  );
};
