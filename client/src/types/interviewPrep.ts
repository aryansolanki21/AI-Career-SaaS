export type InterviewType = "technical" | "hr";

export type QuestionCount = 20 | 30 | 40;

export interface InterviewPrepRequest {
  jobRole: string;
  jobDescription: string;
  interviewType: InterviewType;
  questionCount: QuestionCount;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  hint: string;
}

export interface InterviewPrepResult {
  jobRole: string;
  interviewType: InterviewType;
  totalQuestions: number;
  questions: InterviewQuestion[];
}

export interface InterviewPrepResponse {
  message: string;
  result: InterviewPrepResult;
}
