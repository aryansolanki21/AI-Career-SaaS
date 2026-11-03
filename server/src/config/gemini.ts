import { GoogleGenAI } from "@google/genai";
import { HttpError } from "../utils/http-error.js";

const DEFAULT_MODEL = "gemini-3.8-flash";

// Created on demand, so a missing key gives a clear error instead of a crash at startup.
export const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new HttpError("The AI service is not configured.", 500);
  }

  return new GoogleGenAI({ apiKey });
};

export const getGeminiModel = (override?: string): string =>
  (override || process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
