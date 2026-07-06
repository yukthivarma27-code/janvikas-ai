export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'mr' | 'bn' | 'ur';

export type Category = 
  | 'Education' 
  | 'Roads' 
  | 'Healthcare' 
  | 'Water' 
  | 'Sanitation' 
  | 'Employment' 
  | 'Transport' 
  | 'Agriculture' 
  | 'Digital Access' 
  | 'Other';

export type Urgency = 'Low' | 'Medium' | 'High';

export type RequestStatus = 
  | 'Submitted' 
  | 'Verified' 
  | 'Prioritized' 
  | 'Allocated' 
  | 'In Progress' 
  | 'Completed';

export interface CitizenRequest {
  id: string;
  name: string;
  contact: string;
  constituency: string;
  district: string;
  mandal: string;
  locality: string;
  category: Category;
  description: string;
  urgency: Urgency;
  status: RequestStatus;
  date: string;
  language: Language;
  priorityScore: number; // 0-100 calculated by AI
  upvotes: number;
  latitude: number;
  longitude: number;
  aiAnalysis: {
    sentiment: 'Positive' | 'Neutral' | 'Critical';
    estimatedImpactUsers: number;
    estimatedCostLakhs: number;
    primaryNeed: string;
    justification: string;
  };
}

export interface AIRecommendation {
  id: string;
  title: string;
  category: Category;
  constituency: string;
  district: string;
  priorityScore: number;
  demandLevel: 'Very High' | 'High' | 'Medium';
  estimatedImpact: string;
  estimatedCostLakhs: number;
  reason: string;
  relatedRequestCount: number;
  suggestedMPAction: string;
  timelineMonths: number;
}

export interface ProposalComparison {
  id: string;
  titleA: string;
  titleB: string;
  category: Category;
  constituency: string;
  metrics: {
    label: string;
    valueA: string | number;
    valueB: string | number;
    better: 'A' | 'B' | 'Equal';
  }[];
  aiRecommendation: string;
  finalChoice: 'A' | 'B';
}
