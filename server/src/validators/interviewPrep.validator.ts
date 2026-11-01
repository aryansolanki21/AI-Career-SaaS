import type {
  InterviewPrepRequest,
  InterviewType,
  QuestionCount,
} from "../types/interviewPrep.js";
import { HttpError } from "../utils/http-error.js";

const QUESTION_COUNTS: QuestionCount[] = [20, 30, 40];
const INTERVIEW_TYPES: InterviewType[] = ["technical", "hr"];

export function validateInterviewPrepRequest(
  body: unknown,
): InterviewPrepRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError("Invalid request body.", 400);
  }

  const data = body as Record<string, unknown>;

  const jobRole = typeof data.jobRole === "string" ? data.jobRole.trim() : "";

  const jobDescription =
    typeof data.jobDescription === "string" ? data.jobDescription.trim() : "";

  const interviewType = data.interviewType;
  const questionCount = data.questionCount;

  if (!jobRole || jobRole.length > 100) {
    throw new HttpError("Job role must be between 1 and 100 characters.", 400);
  }

  if (jobDescription.length < 50 || jobDescription.length > 8000) {
    throw new HttpError(
      "Job description must be between 50 and 8000 characters.",
      400,
    );
  }

  if (
    typeof interviewType !== "string" ||
    !INTERVIEW_TYPES.includes(interviewType as InterviewType)
  ) {
    throw new HttpError("Select a valid interview type.", 400);
  }

  if (
    typeof questionCount !== "number" ||
    !QUESTION_COUNTS.includes(questionCount as QuestionCount)
  ) {
    throw new HttpError("Question count must be 20, 30, or 40.", 400);
  }

  return {
    jobRole,
    jobDescription,
    interviewType: interviewType as InterviewType,
    questionCount: questionCount as QuestionCount,
  };
}
