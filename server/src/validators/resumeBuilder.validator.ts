import type { ResumeData } from "../types/resumeBuilder.js";
import { HttpError } from "../utils/http-error.js";
import { toSafeUrl } from "../utils/url.js";

// Limits keep one request from sending a huge prompt to the AI.
const MAX_SHORT_TEXT = 200;
const MAX_URL = 300;
const MAX_SUMMARY = 2000;
const MAX_BULLET = 500;
const MAX_PROJECT_DESCRIPTION = 1500;
const MAX_LIST_ITEM = 100;

const MAX_EXPERIENCE = 10;
const MAX_EDUCATION = 6;
const MAX_PROJECTS = 10;
const MAX_BULLETS = 12;
const MAX_SKILLS = 40;
const MAX_TECHNOLOGIES = 20;
const MAX_CERTIFICATIONS = 15;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readText = (
  value: unknown,
  label: string,
  maxLength: number,
  required = false,
): string => {
  const raw = value ?? "";

  if (typeof raw !== "string") {
    throw new HttpError(`${label} must be text.`, 400);
  }

  const text = raw.trim();

  if (required && !text) {
    throw new HttpError(`${label} is required.`, 400);
  }

  if (text.length > maxLength) {
    throw new HttpError(
      `${label} must not exceed ${maxLength} characters.`,
      400,
    );
  }

  return text;
};

const readUrl = (value: unknown, label: string): string => {
  const text = readText(value, label, MAX_URL);

  if (!text) return "";

  const url = toSafeUrl(text);

  if (!url) {
    throw new HttpError(`${label} must be a valid web address.`, 400);
  }

  return url;
};

// Blank items are dropped instead of rejected.
const readList = (
  value: unknown,
  label: string,
  maxItems: number,
  maxLength: number,
): string[] => {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value) || value.length > maxItems) {
    throw new HttpError(`${label} can have at most ${maxItems} items.`, 400);
  }

  return value.map((item) => readText(item, label, maxLength)).filter(Boolean);
};

const readEntries = <T>(
  value: unknown,
  label: string,
  maxItems: number,
  read: (item: Record<string, unknown>, position: number) => T,
): T[] => {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value) || value.length > maxItems) {
    throw new HttpError(`${label} can have at most ${maxItems} entries.`, 400);
  }

  return value.map((item, index) => {
    if (!isObject(item)) {
      throw new HttpError(`${label} entry ${index + 1} is invalid.`, 400);
    }

    return read(item, index + 1);
  });
};

export const validateManualResume = (value: unknown): ResumeData => {
  if (!isObject(value) || !isObject(value.personalDetails)) {
    throw new HttpError("Personal details are required.", 400);
  }

  const personal = value.personalDetails;

  const resume: ResumeData = {
    personalDetails: {
      fullName: readText(personal.fullName, "Full name", MAX_SHORT_TEXT, true),
      email: readText(personal.email, "Email", MAX_SHORT_TEXT),
      phone: readText(personal.phone, "Phone", MAX_SHORT_TEXT),
      location: readText(personal.location, "Location", MAX_SHORT_TEXT),
      linkedin: readUrl(personal.linkedin, "LinkedIn address"),
      portfolio: readUrl(personal.portfolio, "Portfolio address"),
    },
    professionalSummary: readText(
      value.professionalSummary,
      "Professional summary",
      MAX_SUMMARY,
    ),
    experience: readEntries(
      value.experience,
      "Experience",
      MAX_EXPERIENCE,
      (item, n) => ({
        id: `experience-${n}`,
        jobTitle: readText(
          item.jobTitle,
          `Experience ${n} job title`,
          MAX_SHORT_TEXT,
          true,
        ),
        company: readText(
          item.company,
          `Experience ${n} company`,
          MAX_SHORT_TEXT,
          true,
        ),
        location: readText(
          item.location,
          `Experience ${n} location`,
          MAX_SHORT_TEXT,
        ),
        startDate: readText(
          item.startDate,
          `Experience ${n} start date`,
          MAX_SHORT_TEXT,
        ),
        endDate: readText(
          item.endDate,
          `Experience ${n} end date`,
          MAX_SHORT_TEXT,
        ),
        bullets: readList(
          item.bullets,
          `Experience ${n} bullets`,
          MAX_BULLETS,
          MAX_BULLET,
        ),
      }),
    ),
    education: readEntries(
      value.education,
      "Education",
      MAX_EDUCATION,
      (item, n) => ({
        id: `education-${n}`,
        degree: readText(
          item.degree,
          `Education ${n} degree`,
          MAX_SHORT_TEXT,
          true,
        ),
        institution: readText(
          item.institution,
          `Education ${n} institution`,
          MAX_SHORT_TEXT,
          true,
        ),
        location: readText(
          item.location,
          `Education ${n} location`,
          MAX_SHORT_TEXT,
        ),
        startDate: readText(
          item.startDate,
          `Education ${n} start date`,
          MAX_SHORT_TEXT,
        ),
        endDate: readText(
          item.endDate,
          `Education ${n} end date`,
          MAX_SHORT_TEXT,
        ),
        grade: readText(item.grade, `Education ${n} grade`, MAX_SHORT_TEXT),
      }),
    ),
    technicalSkills: readList(
      value.technicalSkills,
      "Technical skills",
      MAX_SKILLS,
      MAX_LIST_ITEM,
    ),
    softSkills: readList(
      value.softSkills,
      "Soft skills",
      MAX_SKILLS,
      MAX_LIST_ITEM,
    ),
    projects: readEntries(
      value.projects,
      "Projects",
      MAX_PROJECTS,
      (item, n) => ({
        id: `project-${n}`,
        name: readText(item.name, `Project ${n} name`, MAX_SHORT_TEXT, true),
        technologies: readList(
          item.technologies,
          `Project ${n} technologies`,
          MAX_TECHNOLOGIES,
          MAX_LIST_ITEM,
        ),
        description: readText(
          item.description,
          `Project ${n} description`,
          MAX_PROJECT_DESCRIPTION,
        ),
        link: readUrl(item.link, `Project ${n} link`),
      }),
    ),
    certifications: readList(
      value.certifications,
      "Certifications",
      MAX_CERTIFICATIONS,
      MAX_LIST_ITEM,
    ),
  };

  const hasSection =
    resume.professionalSummary ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.projects.length > 0 ||
    resume.technicalSkills.length > 0 ||
    resume.softSkills.length > 0 ||
    resume.certifications.length > 0;

  if (!hasSection) {
    throw new HttpError("Add at least one section besides your name.", 400);
  }

  return resume;
};
