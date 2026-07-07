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

export interface ScoreBreakdown {
  sentiment: number;
  urgency: number;
  upvotes: number;
  density: number;
  antyodaya: number;
  infraGap: number;
  disasterRisk: number;
  finalScore: number;
}

export interface BaselineData {
  villageLgdCode?: string;
  villageName?: string;
  mandalName?: string;
  totalPopulation?: number;
  scStPopulation?: number;
  literacyRate?: number;
  schoolCode?: string;
  schoolName?: string;
  pupilTeacherRatio?: number;
  schoolToilets?: boolean;
  schoolWater?: boolean;
  schoolElectricity?: boolean;
  nearestFacilityName?: string;
  nearestFacilityType?: string;
  nearestFacilityBeds?: number;
  nearestFacilityDoctors?: number;
  nearestFacilityDistanceKm?: number;
  totalHouseholds?: number;
  tapConnectionsPercentage?: number;
  waterQualityStatus?: string;
}

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
  scoreBreakdown?: ScoreBreakdown;
  verifiedGaps?: string[];
  baselineData?: BaselineData;
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
  verifiedGaps?: string[];
  totalPopulationServed?: number;
  baselineSummary?: string;
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
