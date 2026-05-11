export type CareerFormData = {
  school: string;
  major: string;
  grade: string;
  targetRole: string;
  projectName: string;
  projectType: string;
  projectBackground: string;
  responsibilities: string;
  tools: string;
  results: string;
  challenges: string;
  jobDescription: string;
};

export type GenerateResult = {
  conservativeVersion: string[];
  enhancedVersion: string[];
  interviewQuestions: Array<{
    question: string;
    answerGuide: string;
  }>;
  riskWarnings: string[];
  suggestions: string[];
};

export type FeedbackRating = "有帮助" | "一般" | "没帮助";

export type ResultFeedback = {
  rating: FeedbackRating;
  comment: string;
  createdAt: string;
};
