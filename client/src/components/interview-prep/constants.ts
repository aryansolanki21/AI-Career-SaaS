import type { InterviewType, QuestionCount } from "../../types/interviewPrep";

// Keep these in sync with the server validation.
export const MAX_JOB_ROLE_LENGTH = 100;
export const MIN_JOB_DESCRIPTION_LENGTH = 50;
export const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export const QUESTIONS_PER_PAGE = 10;
export const QUESTION_COUNTS: readonly QuestionCount[] = [20, 30, 40];

export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

export const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const INTERVIEW_TYPES: readonly {
  value: InterviewType;
  label: string;
  description: string;
}[] = [
  {
    value: "technical",
    label: "Technical",
    description: "Skills, tools and problem-solving for the role.",
  },
  {
    value: "hr",
    label: "HR & Behavioural",
    description: "Teamwork, communication and workplace situations.",
  },
];

export const INTERVIEW_TYPE_LABEL: Record<InterviewType, string> = {
  technical: "Technical interview",
  hr: "HR & Behavioural interview",
};
