export interface ResumePersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface ResumeExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  technologies: string[];
  description: string;
  link: string;
}

export interface ResumeData {
  personalDetails: ResumePersonalDetails;
  professionalSummary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  technicalSkills: string[];
  softSkills: string[];
  projects: ResumeProject[];
  certifications: string[];
}

export type ResumeBuilderMode = "manual" | "improve";
