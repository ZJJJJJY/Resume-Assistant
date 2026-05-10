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
  conservativeExperience: string;
  roleFocusedExperience: string;
  interviewQuestions: string[];
  riskTips: string[];
};
