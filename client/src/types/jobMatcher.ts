export type RequirementStatus = "matched" | "partial" | "missing";

export type RequirementImportance = "essential" | "preferred";

export type SuggestionPriority = "high" | "medium" | "low";

export interface JobRequirement {
  name: string;
  importance: RequirementImportance;
  status: RequirementStatus;
  jobEvidence: string;
  resumeEvidence: string;
  explanation: string;
}

export interface JobAssessment {
  status: RequirementStatus | "not_specified";
  jobExpectation: string;
  resumeEvidence: string;
  explanation: string;
}

export interface JobStrength {
  title: string;
  evidence: string;
  relevance: string;
}

export interface ImprovementSuggestion {
  priority: SuggestionPriority;
  gap: string;
  recommendation: string;
}

export interface RequirementScore {
  total: number;
  matched: number;
  partial: number;
  missing: number;
}

export interface JobMatchScoreBreakdown {
  essential: RequirementScore;
  preferred: RequirementScore;
  weightedPointsEarned: number;
  weightedPointsPossible: number;
}

export interface JobMatchResult {
  jobTitle: string;
  seniority: string;
  requirements: JobRequirement[];
  experienceAssessment: JobAssessment;
  educationAssessment: JobAssessment;
  strengths: JobStrength[];
  improvementSuggestions: ImprovementSuggestion[];
  summary: string;
  matchScore: number;
  scoreBreakdown: JobMatchScoreBreakdown;
}

export interface JobMatchApiResponse {
  message: string;
  result: JobMatchResult;
}
