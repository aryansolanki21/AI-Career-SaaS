import { Type, type Schema } from "@google/genai";
import { getGeminiClient, getGeminiModel } from "../config/gemini.js";
import {
  RESUME_BUILDER_SYSTEM_PROMPT,
  buildImprovedResumePrompt,
  buildManualResumePrompt,
} from "../config/prompt.js";
import type {
  ResumeBuilderResult,
  ResumeData,
} from "../types/resumeBuilder.js";
import { toAiServiceError } from "../utils/gemini-error.js";
import { HttpError } from "../utils/http-error.js";
import { toSafeUrl } from "../utils/url.js";

const GEMINI_TIMEOUT_MS = 90_000;
const MAX_ENTRIES = 30;
const MAX_LIST_ITEMS = 40;
const MAX_BULLET_ITEMS = 12;

/* ---------- Gemini structured output ---------- */
const text: Schema = { type: Type.STRING };
const textList: Schema = { type: Type.ARRAY, items: text };

const listOf = (items: Schema): Schema => ({
  type: Type.ARRAY,
  items,
});

const objectOf = (properties: Record<string, Schema>): Schema => ({
  type: Type.OBJECT,
  properties,
  required: Object.keys(properties),
});

const RESPONSE_SCHEMA: Schema = objectOf({
  personalDetails: objectOf({
    fullName: text,
    email: text,
    phone: text,
    location: text,
    linkedin: text,
    portfolio: text,
  }),
  professionalSummary: text,
  experience: listOf(
    objectOf({
      jobTitle: text,
      company: text,
      location: text,
      startDate: text,
      endDate: text,
      bullets: textList,
    }),
  ),
  education: listOf(
    objectOf({
      degree: text,
      institution: text,
      location: text,
      startDate: text,
      endDate: text,
      grade: text,
    }),
  ),
  technicalSkills: textList,
  softSkills: textList,
  projects: listOf(
    objectOf({
      name: text,
      technologies: textList,
      description: text,
      link: text,
    }),
  ),
  certifications: textList,
});

/* ---------- Reading and normalizing model output ---------- */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const readTextList = (value: unknown, maxItems = MAX_LIST_ITEMS): string[] => {
  if (!Array.isArray(value)) return [];

  const normalized = value.map(readText).filter(Boolean);

  return [...new Set(normalized)].slice(0, maxItems);
};

const readEntries = <T>(
  value: unknown,
  read: (item: Record<string, unknown>, index: number) => T | null,
): T[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .slice(0, MAX_ENTRIES)
    .map(read)
    .filter((item): item is T => item !== null);
};

const normalizeResume = (value: unknown): ResumeData => {
  if (!isObject(value)) {
    throw new HttpError(
      "The AI service returned an unexpected format. Please try again.",
      502,
    );
  }

  const personal = isObject(value.personalDetails) ? value.personalDetails : {};

  const experience = readEntries(value.experience, (item, index) => {
    const jobTitle = readText(item.jobTitle);
    const company = readText(item.company);
    const location = readText(item.location);
    const startDate = readText(item.startDate);
    const endDate = readText(item.endDate);
    const bullets = readTextList(item.bullets, MAX_BULLET_ITEMS);

    if (
      !jobTitle &&
      !company &&
      !location &&
      !startDate &&
      !endDate &&
      bullets.length === 0
    ) {
      return null;
    }

    return {
      id: `experience-${index + 1}`,
      jobTitle,
      company,
      location,
      startDate,
      endDate,
      bullets,
    };
  });

  const education = readEntries(value.education, (item, index) => {
    const degree = readText(item.degree);
    const institution = readText(item.institution);
    const location = readText(item.location);
    const startDate = readText(item.startDate);
    const endDate = readText(item.endDate);
    const grade = readText(item.grade);

    if (
      !degree &&
      !institution &&
      !location &&
      !startDate &&
      !endDate &&
      !grade
    ) {
      return null;
    }

    return {
      id: `education-${index + 1}`,
      degree,
      institution,
      location,
      startDate,
      endDate,
      grade,
    };
  });

  const projects = readEntries(value.projects, (item, index) => {
    const name = readText(item.name);
    const technologies = readTextList(item.technologies, 20);
    const description = readText(item.description);
    const link = toSafeUrl(readText(item.link));

    if (!name && technologies.length === 0 && !description && !link) {
      return null;
    }

    return {
      id: `project-${index + 1}`,
      name,
      technologies,
      description,
      link,
    };
  });

  return {
    personalDetails: {
      fullName: readText(personal.fullName),
      email: readText(personal.email),
      phone: readText(personal.phone),
      location: readText(personal.location),
      linkedin: toSafeUrl(readText(personal.linkedin)),
      portfolio: toSafeUrl(readText(personal.portfolio)),
    },
    professionalSummary: readText(value.professionalSummary),
    experience,
    education,
    technicalSkills: readTextList(value.technicalSkills),
    softSkills: readTextList(value.softSkills),
    projects,
    certifications: readTextList(value.certifications, 15),
  };
};

const hasContent = (resume: ResumeData): boolean =>
  Boolean(
    resume.personalDetails.fullName ||
    resume.professionalSummary ||
    resume.experience.length ||
    resume.education.length ||
    resume.technicalSkills.length ||
    resume.softSkills.length ||
    resume.projects.length ||
    resume.certifications.length,
  );

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

/* ---------- Gemini request ---------- */
const requestResume = async (prompt: string, pdf?: Buffer): Promise<string> => {
  const ai = getGeminiClient();
  const model = getGeminiModel(process.env.RESUME_BUILDER_GEMINI_MODEL);

  const parts = pdf
    ? [
        { text: prompt },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdf.toString("base64"),
          },
        },
      ]
    : [{ text: prompt }];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: RESUME_BUILDER_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
          httpOptions: {
            timeout: GEMINI_TIMEOUT_MS,
          },
        },
      });

      if (!response.text) {
        throw new HttpError(
          "The AI service returned an empty response. Please try again.",
          502,
        );
      }

      return response.text;
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }

      const status = getProviderStatus(error);

      if (status === 503 && attempt < 2) {
        const delay = 1000 * 2 ** attempt + Math.random() * 500;

        console.warn(
          `Gemini Resume Builder temporarily unavailable. Retrying in ${Math.round(delay)}ms.`,
        );

        await wait(delay);
        continue;
      }

      console.error("Gemini resume builder request failed:", {
        model,
        status,
        message: error instanceof Error ? error.message : String(error),
      });

      throw toAiServiceError(error);
    }
  }

  throw new HttpError("The AI service could not complete your request.", 503);
};

const parseResume = (responseText: string): ResumeData => {
  let data: unknown;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new HttpError(
      "The AI service returned an invalid response. Please try again.",
      502,
    );
  }

  return normalizeResume(data);
};

/* ---------- Public API ---------- */
export const buildResumeFromDetails = async (
  input: ResumeData,
): Promise<ResumeBuilderResult> => {
  const generated = parseResume(
    await requestResume(buildManualResumePrompt(input)),
  );

  if (!hasContent(generated)) {
    throw new HttpError(
      "The AI service could not generate meaningful resume content. Please try again.",
      502,
    );
  }

  return {
    resume: {
      ...generated,
      personalDetails: {
        ...input.personalDetails,
        linkedin: toSafeUrl(input.personalDetails.linkedin),
        portfolio: toSafeUrl(input.personalDetails.portfolio),
      },
    },
  };
};

export const improveExistingResume = async (
  pdf: Buffer,
): Promise<ResumeBuilderResult> => {
  const resume = parseResume(
    await requestResume(buildImprovedResumePrompt(), pdf),
  );

  if (!hasContent(resume)) {
    throw new HttpError(
      "We could not find any resume content in that PDF. Upload a text-based resume PDF, not a scan.",
      422,
    );
  }

  return { resume };
};
