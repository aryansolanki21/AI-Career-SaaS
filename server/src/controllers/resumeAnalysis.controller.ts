import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { Request, Response, NextFunction } from "express";
import {
  RESUME_ANALYSIS_SYSTEM_INSTRUCTION,
  buildResumeAnalysisPrompt,
} from "../config/prompt.js";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";

const MAX_PDF_SIZE = 5 * 1024 * 1024;
// Base64 uses 4 characters for every 3 bytes (plus a little padding).
const MAX_BASE64_LENGTH = Math.ceil(MAX_PDF_SIZE / 3) * 4 + 4;
const MAX_JOB_DESCRIPTION_LENGTH = 8000;
const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-3.8-flash").trim();

//  The overall score is calculated here so it always agrees with the breakdown.
const SCORE_WEIGHTS = {
  formatting: 0.3,
  keywords: 0.3,
  structure: 0.2,
  readability: 0.2,
} as const;

interface ScoreCategory {
  score: number;
  feedback: string;
}

interface ResumeSuggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

interface ModelAnalysis {
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

interface ResumeAnalysis extends ModelAnalysis {
  atsScore: number;
}

//  ---------- Gemini structured output ----------
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
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
        },
        required: ["category", "issue", "recommendation", "priority"],
      },
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
  },
  required: ["scoreBreakdown", "suggestions", "strengths", "summary"],
};

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
};

//  ---------- Validation and normalisation ----------
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
    formatting: { ...formatting, score: roundScore(formatting.score) },
    keywords: { ...keywords, score: roundScore(keywords.score) },
    structure: { ...structure, score: roundScore(structure.score) },
    readability: { ...readability, score: roundScore(readability.score) },
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

// ---------- Main Controller Function ----------
export const analyseResume = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authRequest = req as AuthenticatedRequest;

  try {
    if (!authRequest.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { pdfBase64, jobDescription } = req.body as {
      pdfBase64?: unknown;
      jobDescription?: unknown;
    };

    if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
      res.status(400).json({ message: "Please upload a PDF resume." });
      return;
    }

    if (jobDescription !== undefined && typeof jobDescription !== "string") {
      res.status(400).json({ message: "The job description must be text." });
      return;
    }

    const trimmedJobDescription = (jobDescription ?? "").trim();

    if (trimmedJobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      res.status(400).json({
        message: `The job description must not exceed ${MAX_JOB_DESCRIPTION_LENGTH} characters.`,
      });
      return;
    }

    const normalizedBase64 = pdfBase64.replace(
      /^data:application\/pdf;base64,/i,
      "",
    );

    // Check the length before running any pattern on a large string.
    if (normalizedBase64.length > MAX_BASE64_LENGTH) {
      res.status(413).json({ message: "The PDF must not exceed 5 MB." });
      return;
    }

    if (
      normalizedBase64.length === 0 ||
      normalizedBase64.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(normalizedBase64)
    ) {
      res.status(400).json({ message: "The uploaded PDF data is invalid." });
      return;
    }

    const pdfBuffer = Buffer.from(normalizedBase64, "base64");

    if (pdfBuffer.length === 0) {
      res.status(400).json({ message: "The uploaded PDF is empty." });
      return;
    }

    if (pdfBuffer.length > MAX_PDF_SIZE) {
      res.status(413).json({ message: "The PDF must not exceed 5 MB." });
      return;
    }

    if (pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      res
        .status(400)
        .json({ message: "The uploaded file is not a valid PDF." });
      return;
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: normalizedBase64,
          },
        },
        {
          text: buildResumeAnalysisPrompt(trimmedJobDescription || undefined),
        },
      ],
      config: {
        systemInstruction: RESUME_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });
    console.log("Gemini model:", JSON.stringify(GEMINI_MODEL));

    const responseText = response.text;

    if (!responseText) {
      res
        .status(502)
        .json({ message: "The AI service returned an empty response." });
      return;
    }

    let parsedResult: unknown;

    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      res
        .status(502)
        .json({ message: "The AI service returned an invalid analysis." });
      return;
    }

    if (!isModelAnalysis(parsedResult)) {
      res.status(502).json({
        message: "The AI service returned an unexpected analysis format.",
      });
      return;
    }

    res.status(200).json({
      message: "Resume analysed successfully.",
      analysis: buildAnalysis(parsedResult),
    });
  } catch (error: unknown) {
    next(error);
  }
};
