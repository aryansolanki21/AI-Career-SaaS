import { Type } from "@google/genai";
import { INTERVIEW_PREP_SYSTEM_PROMPT } from "../config/prompt.js";
import { getGeminiClient, getGeminiModel } from "../config/gemini.js";
import type {
  InterviewPrepRequest,
  InterviewPrepResult,
  InterviewQuestion,
} from "../types/interviewPrep.js";
import { toAiServiceError } from "../utils/gemini-error.js";
import { HttpError } from "../utils/http-error.js";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
          },
          category: {
            type: Type.STRING,
          },
          hint: {
            type: Type.STRING,
          },
        },
        required: ["question", "category", "hint"],
      },
    },
  },
  required: ["questions"],
};

const sanitizePromptTags = (value: string): string =>
  value.replace(/<\s*\/?\s*(?:job_role|job_description)\s*>/gi, "");

function parseQuestions(responseText: string): unknown {
  const cleanedResponse = responseText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleanedResponse);
  } catch {
    throw new HttpError(
      "The AI returned an invalid response. Please try again.",
      502,
    );
  }
}

function validateQuestions(
  data: unknown,
  expectedCount: number,
): InterviewQuestion[] {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new HttpError("The AI returned an invalid response.", 502);
  }

  const result = data as Record<string, unknown>;

  if (!Array.isArray(result.questions)) {
    throw new HttpError(
      "The AI response does not contain a question list.",
      502,
    );
  }

  if (result.questions.length !== expectedCount) {
    throw new HttpError(
      "The AI generated an unexpected number of questions.",
      502,
    );
  }

  const questions = result.questions.map(
    (item: unknown, index: number): InterviewQuestion => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        throw new HttpError("The AI generated an invalid question.", 502);
      }

      const question = item as Record<string, unknown>;

      if (
        typeof question.question !== "string" ||
        !question.question.trim() ||
        typeof question.category !== "string" ||
        !question.category.trim() ||
        typeof question.hint !== "string" ||
        !question.hint.trim()
      ) {
        throw new HttpError("The AI generated an incomplete question.", 502);
      }

      const questionText = question.question.trim();
      const category = question.category.trim();
      const hint = question.hint.trim();

      if (questionText.split(/\s+/).length > 40) {
        throw new HttpError(
          "The AI generated a question that is too long.",
          502,
        );
      }

      if (hint.split(/\s+/).length > 25) {
        throw new HttpError(
          "The AI generated a preparation hint that is too long.",
          502,
        );
      }

      if (category.split(/\s+/).length > 3) {
        throw new HttpError(
          "The AI generated an invalid question category.",
          502,
        );
      }

      return {
        id: index + 1,
        question: questionText,
        category,
        hint,
      };
    },
  );

  const uniqueQuestions = new Set(
    questions.map((item) => item.question.toLowerCase()),
  );

  if (uniqueQuestions.size !== questions.length) {
    throw new HttpError("The AI generated duplicate questions.", 502);
  }

  return questions;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getProviderStatus = (error: unknown): number | undefined => {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return undefined;
};

export async function generateInterviewQuestions(
  input: InterviewPrepRequest,
): Promise<InterviewPrepResult> {
  const { jobRole, jobDescription, interviewType, questionCount } = input;

  const safeJobRole = sanitizePromptTags(jobRole);
  const safeJobDescription = sanitizePromptTags(jobDescription);

  // Initialize outside the API error handler so configuration errors
  // retain their original HTTP status.
  const ai = getGeminiClient();
  const model = getGeminiModel(process.env.INTERVIEW_PREP_GEMINI_MODEL);

  let response;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: `
          <job_role>
          ${safeJobRole}
          </job_role>

          <job_description>
          ${safeJobDescription}
          </job_description>

          Interview Type: ${interviewType}

          Required Number of Questions: ${questionCount}

          Generate the interview questions according to the system instructions.
        `.trim(),
        config: {
          systemInstruction: INTERVIEW_PREP_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.7,
        },
      });

      break;
    } catch (error: unknown) {
      const status = getProviderStatus(error);

      if (status === 503 && attempt < 2) {
        const delay = 1000 * 2 ** attempt + Math.random() * 500;

        console.warn(
          `Gemini temporarily unavailable. Retrying in ${Math.round(delay)}ms.`,
        );

        await wait(delay);
        continue;
      }

      console.error("Gemini API request failed:", {
        model,
        status,
        message: error instanceof Error ? error.message : String(error),
      });

      throw toAiServiceError(error);
    }
  }

  if (!response) {
    throw new HttpError("The AI service could not complete your request.", 503);
  }

  const responseText = response.text;

  if (!responseText) {
    throw new HttpError(
      "The AI did not return an interview question set.",
      502,
    );
  }

  const parsedResponse = parseQuestions(responseText);
  const questions = validateQuestions(parsedResponse, questionCount);

  return {
    jobRole,
    interviewType,
    totalQuestions: questions.length,
    questions,
  };
}
