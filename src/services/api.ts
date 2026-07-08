import { CitizenRequest, AIRecommendation, RequestStatus, Category, Urgency, ProposalComparison } from '../types';
import { INITIAL_REQUESTS } from '../mockData';

import { API_BASE_URL, USE_MOCK_DATA } from './config';

export { API_BASE_URL };

// Force mock data mode configuration
export const FORCE_MOCK_DATA = USE_MOCK_DATA;

// Global flag to track if we failed to connect to the backend and are using mock fallbacks
let isUsingFallbackMode = FORCE_MOCK_DATA;

// Getters for connection status
export function isUsingFallback() {
  return isUsingFallbackMode;
}

export function setUsingFallback(value: boolean) {
  isUsingFallbackMode = value;
}

// Client-side LocalStorage DB for offline fallback/mock mode
const LOCAL_STORAGE_KEY = 'janvikas_requests';

function getLocalRequests(): CitizenRequest[] {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!local) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
    return INITIAL_REQUESTS;
  }
  try {
    return JSON.parse(local);
  } catch {
    return INITIAL_REQUESTS;
  }
}

function saveLocalRequests(requests: CitizenRequest[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
}

// Client-side priority simulation helper for submitted requests in mock mode
function simulatePriorityScore(category: Category, urgency: Urgency, upvotes: number): {
  priorityScore: number;
  aiAnalysis: {
    sentiment: 'Positive' | 'Neutral' | 'Critical';
    estimatedImpactUsers: number;
    estimatedCostLakhs: number;
    primaryNeed: string;
    justification: string;
  };
  verifiedGaps: string[];
  baselineData: any;
} {
  const isCritical = urgency === 'High';
  const sentiment = isCritical ? 'Critical' : 'Neutral';
  const estimatedImpactUsers = Math.floor(100 + Math.random() * 800);
  const estimatedCostLakhs = urgency === 'High' ? 18.5 : urgency === 'Medium' ? 8.0 : 3.0;

  const gapsMap: Record<Category, string[]> = {
    Education: ['SCHOOL_TOILET_GAP', 'HIGH_PUPIL_TEACHER_RATIO'],
    Water: ['LOW_TAP_CONNECTION'],
    Healthcare: ['NO_COMMUNITY_HEALTH_CENTER'],
    Roads: ['UNPAVED_ROAD_ACCESS'],
    Sanitation: ['OPEN_DRAINAGE_RISK'],
    Employment: ['LOW_VOCATIONAL_CENTERS'],
    Transport: ['NO_REGULAR_BUS_ROUTE'],
    Agriculture: ['SOIL_TESTING_GAP'],
    'Digital Access': ['NO_INTERNET_TOWER'],
    Other: []
  };

  const verifiedGaps = gapsMap[category] || [];
  const priorityScore = Math.min(
    95,
    (urgency === 'High' ? 40 : urgency === 'Medium' ? 25 : 10) +
    Math.min(30, Math.floor(upvotes / 5)) +
    (verifiedGaps.length > 0 ? 25 : 0) +
    Math.floor(Math.random() * 8)
  );

  return {
    priorityScore,
    aiAnalysis: {
      sentiment,
      estimatedImpactUsers,
      estimatedCostLakhs,
      primaryNeed: `Address local ${category} requirements.`,
      justification: 'Simulated AI Analysis (Mock mode fallback).'
    },
    verifiedGaps,
    baselineData: {
      villageLgdCode: "586202",
      villageName: "Visakhapatnam Local Area",
      mandalName: "Bheemunipatnam",
      totalPopulation: 5200,
      scStPopulation: 1200,
      literacyRate: 68.4,
      schoolCode: "28130102",
      schoolName: "Visakhapatnam Local School",
      pupilTeacherRatio: 32,
      schoolToilets: false,
      schoolWater: true,
      schoolElectricity: true,
      totalHouseholds: 980,
      tapConnectionsPercentage: 35.5,
      waterQualityStatus: "Normal"
    }
  };
}

// 1. Fetch Requests API call wrapper
export async function fetchRequests(): Promise<CitizenRequest[]> {
  if (FORCE_MOCK_DATA) {
    return getLocalRequests();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/requests`);
    if (!res.ok) throw new Error('Backend response error');
    const data = await res.json();
    setUsingFallback(false);
    return data;
  } catch (err) {
    console.warn('Failed to connect to server. Falling back to mock data.', err);
    setUsingFallback(true);
    return getLocalRequests();
  }
}

// 2. Submit Request API wrapper
export async function submitRequest(requestData: any): Promise<CitizenRequest> {
  if (FORCE_MOCK_DATA) {
    const local = getLocalRequests();
    const stats = simulatePriorityScore(requestData.category, requestData.urgency, 1);
    const newRequest: CitizenRequest = {
      ...requestData,
      id: `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
      priorityScore: stats.priorityScore,
      upvotes: 1,
      aiAnalysis: stats.aiAnalysis,
      verifiedGaps: stats.verifiedGaps,
      baselineData: stats.baselineData
    };
    local.unshift(newRequest);
    saveLocalRequests(local);
    return newRequest;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to submit request');
    const data = await res.json();
    setUsingFallback(false);
    return data;
  } catch (err) {
    console.warn('Failed to submit to backend, using local/mock storage.', err);
    setUsingFallback(true);
    const local = getLocalRequests();
    const stats = simulatePriorityScore(requestData.category, requestData.urgency, 1);
    const newRequest: CitizenRequest = {
      ...requestData,
      id: `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
      priorityScore: stats.priorityScore,
      upvotes: 1,
      aiAnalysis: stats.aiAnalysis,
      verifiedGaps: stats.verifiedGaps,
      baselineData: stats.baselineData
    };
    local.unshift(newRequest);
    saveLocalRequests(local);
    return newRequest;
  }
}

// 3. Upvote Request API wrapper
export async function upvoteRequest(id: string): Promise<CitizenRequest> {
  if (FORCE_MOCK_DATA) {
    const local = getLocalRequests();
    const index = local.findIndex(r => r.id === id);
    if (index !== -1) {
      local[index].upvotes += 1;
      // recalculate priority score slightly
      local[index].priorityScore = Math.min(99, local[index].priorityScore + 1);
      saveLocalRequests(local);
      return local[index];
    }
    throw new Error('Request not found');
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('Failed to upvote');
    const data = await res.json();
    setUsingFallback(false);
    return data;
  } catch (err) {
    console.warn('Failed to connect to backend, upvoting request locally.', err);
    setUsingFallback(true);
    const local = getLocalRequests();
    const index = local.findIndex(r => r.id === id);
    if (index !== -1) {
      local[index].upvotes += 1;
      local[index].priorityScore = Math.min(99, local[index].priorityScore + 1);
      saveLocalRequests(local);
      return local[index];
    }
    throw new Error('Request not found locally');
  }
}

// 4. Update Status API wrapper
export async function updateRequestStatus(id: string, status: RequestStatus): Promise<CitizenRequest> {
  if (FORCE_MOCK_DATA) {
    const local = getLocalRequests();
    const index = local.findIndex(r => r.id === id);
    if (index !== -1) {
      local[index].status = status;
      saveLocalRequests(local);
      return local[index];
    }
    throw new Error('Request not found');
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    const data = await res.json();
    setUsingFallback(false);
    return data;
  } catch (err) {
    console.warn('Failed to connect to backend, updating status locally.', err);
    setUsingFallback(true);
    const local = getLocalRequests();
    const index = local.findIndex(r => r.id === id);
    if (index !== -1) {
      local[index].status = status;
      saveLocalRequests(local);
      return local[index];
    }
    throw new Error('Request not found locally');
  }
}

// 5. Prioritize Form Check wrapper
export async function prioritizeRequest(requestData: any): Promise<any> {
  if (FORCE_MOCK_DATA) {
    const stats = simulatePriorityScore(requestData.category, requestData.urgency, 1);
    return {
      ...stats.aiAnalysis,
      priorityScore: stats.priorityScore,
      verifiedGaps: stats.verifiedGaps,
      baselineData: stats.baselineData
    };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/prioritize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!res.ok) throw new Error('Failed to prioritize');
    const data = await res.json();
    setUsingFallback(false);
    return data;
  } catch (err) {
    console.warn('Failed to prioritize on backend, simulating result.', err);
    setUsingFallback(true);
    const stats = simulatePriorityScore(requestData.category, requestData.urgency, 1);
    return {
      ...stats.aiAnalysis,
      priorityScore: stats.priorityScore,
      verifiedGaps: stats.verifiedGaps,
      baselineData: stats.baselineData
    };
  }
}

// 6. Recommendations API wrapper
export async function fetchRecommendations(): Promise<AIRecommendation[]> {
  const mockRecs: AIRecommendation[] = [
    {
      id: "REC-001",
      title: "Drinking Water Grid Expansion & Filtration Units",
      category: "Water",
      constituency: "Visakhapatnam",
      district: "Visakhapatnam",
      priorityScore: 92,
      demandLevel: "Very High",
      estimatedImpact: "Laying Jal Jeevan pipe networks and setting up Fluoride filtration nodes across Bheemunipatnam village centers.",
      estimatedCostLakhs: 18.0,
      reason: "Groups 5 high-priority citizen reports detailing groundwater fluoride contamination and lack of tap access.",
      relatedRequestCount: 5,
      suggestedMPAction: "Recommend Q1 funding sanction of ₹18.0 Lakhs from MPLADS local grid improvement quota.",
      timelineMonths: 3,
      verifiedGaps: ["LOW_TAP_CONNECTION"],
      totalPopulationServed: 6500,
      baselineSummary: "Census and JJM maps show tap connection share under 30% in target mandal."
    },
    {
      id: "REC-002",
      title: "Mandal Girls Primary School Twin Toilet Blocks",
      category: "Education",
      constituency: "Visakhapatnam",
      district: "Visakhapatnam",
      priorityScore: 89,
      demandLevel: "High",
      estimatedImpact: "Construction of functional hygiene blocks with continuous running water supply to prevent dropout of female students.",
      estimatedCostLakhs: 6.5,
      reason: "Groups school sanitation gaps verified through UDISE+ and multiple active complaints from Bheemunipatnam school clusters.",
      relatedRequestCount: 3,
      suggestedMPAction: "Initiate emergency allocation of ₹6.5 Lakhs from MPLADS school sanitation reserve.",
      timelineMonths: 2,
      verifiedGaps: ["SCHOOL_TOILET_GAP"],
      totalPopulationServed: 1200,
      baselineSummary: "UDISE+ database confirms absence of functional sanitation toilet grids."
    },
    {
      id: "REC-003",
      title: "Mandal Primary Health Sub-Center Bed & Doctor Allocation",
      category: "Healthcare",
      constituency: "Visakhapatnam",
      district: "Visakhapatnam",
      priorityScore: 81,
      demandLevel: "Medium",
      estimatedImpact: "Equipping localized PHC nodes with active beds and medical personnel to reduce travel distances to town hospitals.",
      estimatedCostLakhs: 25.0,
      reason: "Identifies severe healthcare distance gaps exceeding 12km in rural sectors based on census and HFR datasets.",
      relatedRequestCount: 4,
      suggestedMPAction: "Allocate ₹25.0 Lakhs in partnership with State health corpus for rural PHC upgrades.",
      timelineMonths: 4,
      verifiedGaps: ["NO_COMMUNITY_HEALTH_CENTER"],
      totalPopulationServed: 14000,
      baselineSummary: "Health facility records indicate nearest clinic distance is 14km away."
    }
  ];

  if (FORCE_MOCK_DATA) {
    return mockRecs;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const data = await res.json();
    setUsingFallback(false);
    return data;
  } catch (err) {
    console.warn('Failed to fetch recommendations, serving mock data.', err);
    setUsingFallback(true);
    return mockRecs;
  }
}

// 7. Proposal Comparison wrapper
export async function compareProposals(idA: string, idB: string): Promise<ProposalComparison> {
  const localRequests = getRequestsFromStorage();
  const reqA = localRequests.find(r => r.id === idA);
  const reqB = localRequests.find(r => r.id === idB);

  const mockCompare: ProposalComparison = {
    id: "COMP-MOCK",
    titleA: reqA ? `Local ${reqA.category} project at ${reqA.locality}` : "Proposal A",
    titleB: reqB ? `Local ${reqB.category} project at ${reqB.locality}` : "Proposal B",
    category: reqA ? reqA.category : "Water",
    constituency: reqA ? reqA.constituency : "Visakhapatnam",
    metrics: [
      {
        label: "AI Priority Score",
        valueA: reqA ? `${reqA.priorityScore}%` : "80%",
        valueB: reqB ? `${reqB.priorityScore}%` : "75%",
        better: (reqA?.priorityScore || 80) > (reqB?.priorityScore || 75) ? "A" : "B"
      },
      {
        label: "Estimated Outlay",
        valueA: reqA ? `₹${reqA.aiAnalysis.estimatedCostLakhs} Lakhs` : "₹12.0 Lakhs",
        valueB: reqB ? `₹${reqB.aiAnalysis.estimatedCostLakhs} Lakhs` : "₹6.5 Lakhs",
        better: (reqA?.aiAnalysis.estimatedCostLakhs || 12.0) < (reqB?.aiAnalysis.estimatedCostLakhs || 6.5) ? "A" : "B"
      },
      {
        label: "Est. Impact Users",
        valueA: reqA ? `${reqA.aiAnalysis.estimatedImpactUsers} citizens` : "500 citizens",
        valueB: reqB ? `${reqB.aiAnalysis.estimatedImpactUsers} citizens` : "1200 citizens",
        better: (reqA?.aiAnalysis.estimatedImpactUsers || 500) > (reqB?.aiAnalysis.estimatedImpactUsers || 1200) ? "A" : "B"
      },
      {
        label: "Urgency Rating",
        valueA: reqA ? reqA.urgency : "Medium",
        valueB: reqB ? reqB.urgency : "High",
        better: reqB?.urgency === 'High' ? "B" : "A"
      },
      {
        label: "Citizen Upvotes",
        valueA: reqA ? `${reqA.upvotes} upvotes` : "40",
        valueB: reqB ? `${reqB.upvotes} upvotes` : "90",
        better: (reqA?.upvotes || 40) > (reqB?.upvotes || 90) ? "A" : "B"
      },
      {
        label: "Infrastructure Gaps Met",
        valueA: reqA?.verifiedGaps ? reqA.verifiedGaps.join(', ') : "None",
        valueB: reqB?.verifiedGaps ? reqB.verifiedGaps.join(', ') : "None",
        better: (reqA?.verifiedGaps?.length || 0) > (reqB?.verifiedGaps?.length || 0) ? "A" : "B"
      }
    ],
    aiRecommendation: "Dynamic local evaluation recommends prioritizing Proposal B due to the immediate safety risk, high public demand support, and higher efficiency of budget utilization.",
    finalChoice: "B"
  };

  if (FORCE_MOCK_DATA) {
    return mockCompare;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idA, idB })
    });
    if (!res.ok) throw new Error('Failed to run comparison');
    const data = await res.json();
    setUsingFallback(false);
    return data;
  } catch (err) {
    console.warn('Failed to compare proposals, serving simulated metrics.', err);
    setUsingFallback(true);
    return mockCompare;
  }
}

// Helper to query localStorage requests safely inside comparison generator
function getRequestsFromStorage(): CitizenRequest[] {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!local) return INITIAL_REQUESTS;
  try { return JSON.parse(local); } catch { return INITIAL_REQUESTS; }
}
