import { GoogleGenAI } from "@google/genai";
import { INTERVIEW_PREP_SYSTEM_PROMPT } from "../config/prompt.js";
import type {
  InterviewPrepRequest,
  InterviewPrepResult,
  InterviewQuestion,
} from "../types/interviewPrep.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function parseQuestions(responseText: string): unknown {
  const cleanedResponse = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(cleanedResponse);
}

function validateQuestions(
  data: unknown,
  expectedCount: number,
): InterviewQuestion[] {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response received from AI.");
  }

  const result = data as Record<string, unknown>;

  if (!Array.isArray(result.questions)) {
    throw new Error("AI response does not contain a question list.");
  }

  if (result.questions.length !== expectedCount) {
    throw new Error("AI generated an unexpected number of questions.");
  }

  const questions = result.questions.map(
    (item: unknown, index: number): InterviewQuestion => {
      if (!item || typeof item !== "object") {
        throw new Error("AI generated an invalid question.");
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
        throw new Error("AI generated an incomplete question.");
      }

      return {
        id: index + 1,
        question: question.question.trim(),
        category: question.category.trim(),
        hint: question.hint.trim(),
      };
    },
  );

  const uniqueQuestions = new Set(
    questions.map((item) => item.question.toLowerCase()),
  );

  if (uniqueQuestions.size !== questions.length) {
    throw new Error("AI generated duplicate questions.");
  }

  return questions;
}

export async function generateInterviewQuestions(
  input: InterviewPrepRequest,
): Promise<InterviewPrepResult> {
  const { jobRole, jobDescription, interviewType, questionCount } = input;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL!,
    contents: `
      Job Role:
      ${jobRole}

      Job Description:
      ${jobDescription}

      Interview Type:
      ${interviewType}

      Required Number of Questions:
      ${questionCount}

      Generate the interview questions according to the system instructions.
    `,
    config: {
      systemInstruction: INTERVIEW_PREP_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const responseText = response.text;

  if (!responseText) {
    throw new Error("AI did not return an interview question set.");
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
