export type UserRole = 'agent' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export type ModuleId =
  | 'email_improvement'
  | 'complaint_handling'
  | 'call_script'
  | 'soft_skills'
  | 'escalation'
  | 'email_writer';

export interface HistoryItem {
  id: string;
  userId: string;
  userName: string;
  moduleId: ModuleId;
  timestamp: string;
  tone: string;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  review?: ManagerReview;
}

export interface ManagerReview {
  id: string;
  historyId: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  status: 'reviewed' | 'needs_work' | 'exemplary';
  improvementAreas: string[];
  timestamp: string;
}

export interface LearningResource {
  id: string;
  category: 'email_writing' | 'complaint_handling' | 'call_script' | 'escalation' | 'soft_skills' | 'phrase_bank';
  title: string;
  content: string; // Detailed description or lists
  items?: { original: string; better: string; explanation?: string }[];
  checklist?: string[];
  phrases?: { expression: string; context: string; category: 'positive' | 'negative-replacement' }[];
}
