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
  recommendedResumeVersion?: string[];
  conservativeVersion: string[];
  enhancedVersion: string[];
  interviewQuestions: Array<{
    question: string;
    answerGuide: string;
  }>;
  riskWarnings: string[];
  suggestions: string[];
  source?: "ai" | "mock";
  fallbackReason?: string;
};

export type FeedbackRating = "有帮助" | "一般" | "没帮助";

export type ResultFeedback = {
  rating: FeedbackRating;
  comment: string;
  createdAt: string;
  targetRole?: string;
  projectName?: string;
};

export type InputQualityAnalysis = {
  completenessLevel: "high" | "medium" | "low";
  issues: string[];
  suggestions: string[];
};

export type TrialHistoryItem = {
  id: string;
  formData: CareerFormData;
  result: GenerateResult;
  createdAt: string;
  source: "ai" | "mock";
  completenessLevel: InputQualityAnalysis["completenessLevel"];
};

export type TrialEventName =
  | "form_started"
  | "example_filled"
  | "generate_clicked"
  | "generate_success"
  | "generate_failed"
  | "copy_all_clicked"
  | "copy_section_clicked"
  | "regenerate_clicked"
  | "feedback_submitted";

export type TrialEvent = {
  eventName: TrialEventName;
  timestamp: string;
  sessionId: string;
  targetRole?: string;
  projectType?: string;
  source?: "ai" | "mock";
  completenessLevel?: InputQualityAnalysis["completenessLevel"];
};
