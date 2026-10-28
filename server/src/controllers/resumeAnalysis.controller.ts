import { GoogleGenAI } from "@google/genai";
import type { Request, Response, NextFunction } from "express";
import { RESUME_ANALYSIS_PROMPT } from "../config/resumeAnalysis.prompt.js";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.js";

const MAX_PDF_SIZE = 5 * 1024 * 1024;
const GEMINI_MODEL = "gemini-2.5-flash";

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

interface ResumeAnalysis {
  atsScore: number;
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

const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
};

const isScoreCategory = (value: unknown): value is ScoreCategory => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const category = value as Record<string, unknown>;

  return (
    typeof category.score === "number" &&
    Number.isInteger(category.score) &&
    category.score >= 0 &&
    category.score <= 100 &&
    typeof category.feedback === "string"
  );
};

const isResumeAnalysis = (value: unknown): value is ResumeAnalysis => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const analysis = value as Record<string, unknown>;
  const breakdown = analysis.scoreBreakdown;

  if (typeof breakdown !== "object" || breakdown === null) {
    return false;
  }

  const scores = breakdown as Record<string, unknown>;

  const validSuggestions =
    Array.isArray(analysis.suggestions) &&
    analysis.suggestions.every((suggestion: unknown) => {
      if (typeof suggestion !== "object" || suggestion === null) {
        return false;
      }

      const item = suggestion as Record<string, unknown>;

      return (
        typeof item.category === "string" &&
        typeof item.issue === "string" &&
        typeof item.recommendation === "string" &&
        ["high", "medium", "low"].includes(String(item.priority))
      );
    });

  return (
    typeof analysis.atsScore === "number" &&
    Number.isInteger(analysis.atsScore) &&
    analysis.atsScore >= 0 &&
    analysis.atsScore <= 100 &&
    isScoreCategory(scores.formatting) &&
    isScoreCategory(scores.keywords) &&
    isScoreCategory(scores.structure) &&
    isScoreCategory(scores.readability) &&
    validSuggestions &&
    Array.isArray(analysis.strengths) &&
    analysis.strengths.every(
      (strength: unknown) => typeof strength === "string",
    ) &&
    typeof analysis.summary === "string"
  );
};

export const analyseResume = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authRequest = req as AuthenticatedRequest;

  try {
    const { pdfBase64 } = req.body as {
      pdfBase64?: unknown;
    };

    if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
      res.status(400).json({
        message: "Please upload a PDF resume.",
      });
      return;
    }

    const normalizedBase64 = pdfBase64.replace(
      /^data:application\/pdf;base64,/i,
      "",
    );

    const base64Pattern =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    if (!base64Pattern.test(normalizedBase64)) {
      res.status(400).json({
        message: "The uploaded PDF data is invalid.",
      });
      return;
    }

    const pdfBuffer = Buffer.from(normalizedBase64, "base64");

    if (pdfBuffer.length === 0) {
      res.status(400).json({
        message: "The uploaded PDF is empty.",
      });
      return;
    }

    if (pdfBuffer.length > MAX_PDF_SIZE) {
      res.status(413).json({
        message: "The PDF must not exceed 5 MB.",
      });
      return;
    }

    if (pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      res.status(400).json({
        message: "The uploaded file is not a valid PDF.",
      });
      return;
    }

    if (!authRequest.user) {
      res.status(401).json({
        message: "Authentication required.",
      });
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
          text: RESUME_ANALYSIS_PROMPT,
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text;

    if (!responseText) {
      res.status(502).json({
        message: "The AI service returned an empty response.",
      });
      return;
    }

    let parsedResult: unknown;

    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      res.status(502).json({
        message: "The AI service returned an invalid analysis.",
      });
      return;
    }

    if (!isResumeAnalysis(parsedResult)) {
      res.status(502).json({
        message: "The AI service returned an unexpected analysis format.",
      });
      return;
    }

    res.status(200).json({
      message: "Resume analyzed successfully.",
      analysis: parsedResult,
    });
  } catch (error: unknown) {
    next(error);
  }
};
