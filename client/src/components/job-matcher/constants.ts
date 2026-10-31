import type {
  JobAssessment,
  JobRequirement,
  SuggestionPriority,
} from "../../types/jobMatcher";

export const MAX_PDF_SIZE = 5 * 1024 * 1024;
export const MIN_JOB_DESCRIPTION_LENGTH = 50;
export const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

type AssessmentStatus = JobAssessment["status"];

export const STATUS_LABEL: Record<AssessmentStatus, string> = {
  matched: "Matched",
  partial: "Partial",
  missing: "Missing",
  not_specified: "Not specified",
};

export const STATUS_BADGE: Record<AssessmentStatus, string> = {
  matched: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  missing: "border-red-200 bg-red-50 text-red-700",
  not_specified: "border-slate-200 bg-slate-50 text-slate-600",
};

// Gaps first, so the most useful rows are at the top of the list.
export const STATUS_ORDER: Record<JobRequirement["status"], number> = {
  missing: 0,
  partial: 1,
  matched: 2,
};

export const IMPORTANCE_LABEL: Record<JobRequirement["importance"], string> = {
  essential: "Essential",
  preferred: "Preferred",
};

export const IMPORTANCE_ORDER: Record<JobRequirement["importance"], number> = {
  essential: 0,
  preferred: 1,
};

export const PRIORITY_LABEL: Record<SuggestionPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export const PRIORITY_BADGE: Record<SuggestionPriority, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};

export const PRIORITY_ORDER: Record<SuggestionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
