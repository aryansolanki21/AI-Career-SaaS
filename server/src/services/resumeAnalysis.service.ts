import { Type, type Schema } from "@google/genai";

import {
  RESUME_ANALYSIS_SYSTEM_INSTRUCTION,
  buildResumeAnalysisPrompt,
} from "../config/prompt.js";
import { getGeminiClient, getGeminiModel } from "../config/gemini.js";
import { HttpError } from "../utils/http-error.js";

export interface ScoreCategory {
  score: number;
  feedback: string;
}

export interface ResumeSuggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

export interface ModelAnalysis {
  scoreBreakdown: {
    formatting: ScoreCategory;
    keywords: ScoreCategory;
    structure: ScoreCategory;
    readability: ScoreCategory;
  };
  suggestions: ResumeSuggestion[];
  strengths: string[];
  summary: string;
}

export interface ResumeAnalysis extends ModelAnalysis {
  atsScore: number;
}

const SCORE_WEIGHTS = {
  formatting: 0.3,
  keywords: 0.3,
  structure: 0.2,
  readability: 0.2,
} as const;

const scoreCategorySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    feedback: { type: Type.STRING },
  },
  required: ["score", "feedback"],
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    scoreBreakdown: {
      type: Type.OBJECT,
      properties: {
        formatting: scoreCategorySchema,
        keywords: scoreCategorySchema,
        structure: scoreCategorySchema,
        readability: scoreCategorySchema,
      },
      required: ["formatting", "keywords", "structure", "readability"],
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          issue: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          priority: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
          },
        },
        required: ["category", "issue", "recommendation", "priority"],
      },
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    summary: { type: Type.STRING },
  },
  required: ["scoreBreakdown", "suggestions", "strengths", "summary"],
};

const isScore = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100;

const isScoreCategory = (value: unknown): value is ScoreCategory => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const category = value as Record<string, unknown>;

  return isScore(category.score) && typeof category.feedback === "string";
};

const isSuggestion = (value: unknown): value is ResumeSuggestion => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.category === "string" &&
    typeof item.issue === "string" &&
    typeof item.recommendation === "string" &&
    ["high", "medium", "low"].includes(String(item.priority))
  );
};

const isModelAnalysis = (value: unknown): value is ModelAnalysis => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const analysis = value as Record<string, unknown>;
  const breakdown = analysis.scoreBreakdown;

  if (typeof breakdown !== "object" || breakdown === null) {
    return false;
  }

  const scores = breakdown as Record<string, unknown>;

  return (
    isScoreCategory(scores.formatting) &&
    isScoreCategory(scores.keywords) &&
    isScoreCategory(scores.structure) &&
    isScoreCategory(scores.readability) &&
    Array.isArray(analysis.suggestions) &&
    analysis.suggestions.every(isSuggestion) &&
    Array.isArray(analysis.strengths) &&
    analysis.strengths.every((item: unknown) => typeof item === "string") &&
    typeof analysis.summary === "string"
  );
};

const roundScore = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value)));

const buildAnalysis = (model: ModelAnalysis): ResumeAnalysis => {
  const { formatting, keywords, structure, readability } = model.scoreBreakdown;

  const breakdown = {
    formatting: {
      ...formatting,
      score: roundScore(formatting.score),
    },
    keywords: {
      ...keywords,
      score: roundScore(keywords.score),
    },
    structure: {
      ...structure,
      score: roundScore(structure.score),
    },
    readability: {
      ...readability,
      score: roundScore(readability.score),
    },
  };

  const atsScore = roundScore(
    breakdown.formatting.score * SCORE_WEIGHTS.formatting +
      breakdown.keywords.score * SCORE_WEIGHTS.keywords +
      breakdown.structure.score * SCORE_WEIGHTS.structure +
      breakdown.readability.score * SCORE_WEIGHTS.readability,
  );

  return {
    atsScore,
    scoreBreakdown: breakdown,
    suggestions: model.suggestions,
    strengths: model.strengths,
    summary: model.summary,
  };
};

const getGeminiErrorStatus = (error: unknown): number | null => {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const value = error as Record<string, unknown>;

  return typeof value.status === "number" ? value.status : null;
};

const getGeminiErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || error === null) {
    return "";
  }

  const value = error as Record<string, unknown>;
  const message = value.message;

  return typeof message === "string" ? message : "";
};

export const analyseResumeWithAi = async (
  pdfBase64: string,
  jobDescription?: string,
): Promise<ResumeAnalysis> => {
  const ai = getGeminiClient();

  const model = getGeminiModel(process.env.RESUME_ANALYSIS_GEMINI_MODEL);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64,
          },
        },
        {
          text: buildResumeAnalysisPrompt(jobDescription),
        },
      ],
      config: {
        systemInstruction: RESUME_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    console.log("Gemini model:", model);

    const responseText = response.text;

    if (!responseText) {
      throw new HttpError(
        "The AI service returned an empty response.",
        502,
        "AI_EMPTY_RESPONSE",
      );
    }

    let parsedResult: unknown;

    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      throw new HttpError(
        "The AI service returned an invalid analysis.",
        502,
        "AI_INVALID_RESPONSE",
      );
    }

    if (!isModelAnalysis(parsedResult)) {
      throw new HttpError(
        "The AI service returned an unexpected analysis format.",
        502,
        "AI_INVALID_RESPONSE",
      );
    }

    return buildAnalysis(parsedResult);
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }

    const status = getGeminiErrorStatus(error);

    if (status === 503) {
      console.error(
        "Gemini service unavailable:",
        getGeminiErrorMessage(error),
      );

      throw new HttpError(
        "The AI service is temporarily busy. Please wait a moment and try again.",
        503,
        "AI_SERVICE_UNAVAILABLE",
      );
    }

    if (status === 429) {
      console.error("Gemini rate limit reached:", getGeminiErrorMessage(error));

      throw new HttpError(
        "The AI service is temporarily rate limited. Please try again shortly.",
        429,
        "AI_RATE_LIMITED",
      );
    }

    console.error("Resume analysis AI request failed:", error);

    throw new HttpError(
      "Unable to analyse your resume right now. Please try again.",
      502,
      "AI_REQUEST_FAILED",
    );
  }
};
