export type TemplateId = 'tech' | 'corporate' | 'minimalist' | 'startup';
export type AccentColor = '#2563eb' | '#059669' | '#4f46e5' | '#dc2626' | '#7c3aed' | '#0f172a';
export type TypographyFont = 'sans' | 'serif' | 'mono';
export type LayoutDensity = 'compact' | 'normal' | 'spacious';

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bulletPoints: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface ResumeData {
  id: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    summary: string;
  };
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: ProjectItem[];
  certifications: string[];
  styling: {
    templateId: TemplateId;
    accentColor: AccentColor;
    fontFamily: TypographyFont;
    density: LayoutDensity;
  };
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  rawText: string;
  extractedSkills: string[];
  requiredYears: number;
}

export interface KeywordGap {
  keyword: string;
  category: 'technical' | 'soft' | 'domain';
  importance: 'critical' | 'recommended' | 'optional';
  foundInResume: boolean;
}

export interface ActionVerbSuggestion {
  original: string;
  suggested: string[];
  context: string;
}

export interface AtsReport {
  overallScore: number;
  skillsMatchScore: number;
  keywordMatchScore: number;
  experienceMatchScore: number;
  formattingScore: number;
  matchedKeywords: string[];
  missingKeywords: KeywordGap[];
  weakActionVerbs: ActionVerbSuggestion[];
  actionableTips: string[];
  summary: string;
}

export type InterviewTier = 'basic' | 'intermediate' | 'scenario' | 'system_design';
export type RoleCategory = 'tester' | 'developer' | 'lead' | 'manager' | 'hr' | 'product' | 'data' | 'designer' | 'general';

export interface InterviewQuestion {
  id: string;
  question: string;
  tier: InterviewTier;
  category: string;
  hints: string[];
  sampleAnswer: string;
  roleCategory?: RoleCategory | string;
  stageName?: string;
  stageNumber?: number;
  timeAllocationMins?: number;
}

export interface InterviewResponse {
  questionId: string;
  questionText: string;
  candidateAnswerText: string;
  durationSeconds: number;
  audioRecorded: boolean;
  audioUrl?: string;
  proctoringFlagsDuringQuestion: number;
}

export interface ProctoringEvent {
  id: string;
  timestamp: string;
  eventType: 'tab_switch' | 'window_blur' | 'minimized' | 'prolonged_inactivity';
  durationSeconds?: number;
}

export interface InterviewSession {
  id: string;
  resumeId: string;
  jobDescriptionTitle: string;
  tier: InterviewTier;
  roleCategory?: string;
  interviewMode?: '45min_full' | 'express' | 'custom';
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  proctoringEvents: ProctoringEvent[];
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuestionEvaluation {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  audioUrl?: string;
  score: number; // 0-100
  isCorrect?: boolean;
  correctnessCategory?: 'correct' | 'partially_correct' | 'incorrect';
  verdictTitle?: string;
  strengths: string[];
  improvements: string[];
  idealKeyPoints: string[];
  technicalAccuracyScore: number;
}

export interface InterviewScorecard {
  sessionId: string;
  overallReadinessScore: number;
  technicalAccuracyScore: number;
  communicationScore: number;
  proctoringIntegrityScore: number;
  candidateReadinessStatus?: 'ready' | 'needs_practice';
  readinessTitle?: string;
  readinessReasoning?: string;
  fillerWordsAnalytics: {
    totalFillerCount: number;
    detectedWords: { word: string; count: number }[];
    wordsPerMinute: number;
  };
  questionEvaluations: QuestionEvaluation[];
  microLearningRecommendations: {
    topic: string;
    resourceType: 'article' | 'documentation' | 'practice_exercise' | 'system_design';
    title: string;
    description: string;
    url?: string;
  }[];
  summaryFeedback: string;
  createdAt: string;
}

export interface SingleAnswerCheckResult {
  isCorrect: boolean;
  correctnessCategory: 'correct' | 'partially_correct' | 'incorrect';
  verdictTitle: string;
  score: number;
  strengths: string[];
  missingConcepts: string[];
  idealKeyPoints: string[];
  suggestion: string;
}

export interface IdealAnswerResult {
  idealAnswer: string;
  keyPointsCovered: string[];
  expertTip: string;
}

export type PlanType = 'free_explorer' | 'pro_careerist' | 'pay_per_prep' | 'enterprise';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSubscription {
  plan: PlanType;
  interviewCredits: number;
  atsScansRemaining: number;
  builderCreationsRemaining: number; // -1 for unlimited
  isSubscribed: boolean;
  renewalDate?: string;
}
