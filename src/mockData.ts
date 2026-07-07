import React from 'react';
import { 
  GraduationCap, 
  Milestone, 
  HeartPulse, 
  Droplets, 
  Trash2, 
  Briefcase, 
  Bus, 
  Sprout, 
  Wifi, 
  HelpCircle 
} from 'lucide-react';
import { CitizenRequest, AIRecommendation, ProposalComparison, Language, Category } from './types';

export function getCategoryIcon(category: Category, className = "w-4 h-4") {
  switch (category) {
    case 'Education':
      return React.createElement(GraduationCap, { className });
    case 'Roads':
      return React.createElement(Milestone, { className });
    case 'Healthcare':
      return React.createElement(HeartPulse, { className });
    case 'Water':
      return React.createElement(Droplets, { className });
    case 'Sanitation':
      return React.createElement(Trash2, { className });
    case 'Employment':
      return React.createElement(Briefcase, { className });
    case 'Transport':
      return React.createElement(Bus, { className });
    case 'Agriculture':
      return React.createElement(Sprout, { className });
    case 'Digital Access':
      return React.createElement(Wifi, { className });
    default:
      return React.createElement(HelpCircle, { className });
  }
}

export const LANGUAGES: Record<Language, { name: string; native: string; welcome: string; submit: string; track: string; mpDashboard: string }> = {
  en: { name: 'English', native: 'English', welcome: 'Welcome to JanVikas AI', submit: 'Submit Request', track: 'Track Request', mpDashboard: 'MP Command Center' },
  hi: { name: 'Hindi', native: 'हिन्दी', welcome: 'जनविकास AI में आपका स्वागत है', submit: 'अनुरोध दर्ज करें', track: 'ट्रैक करें', mpDashboard: 'सांसद कमान केंद्र' },
  te: { name: 'Telugu', native: 'తెలుగు', welcome: 'జనవికాస్ AI కి స్వాగతం', submit: 'అభ్యర్థన సమర్పించండి', track: 'ట్రాక్ చేయండి', mpDashboard: 'MP కమాండ్ సెంటర్' },
  ta: { name: 'Tamil', native: 'தமிழ்', welcome: 'ஜனவிகாஸ் AI-க்கு வரவேற்கிறோம்', submit: 'கோரிக்கை சமர்ப்பி', track: 'நிலை அறிதல்', mpDashboard: 'நாடாளுமன்ற உறுப்பினர் மையம்' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ', welcome: 'ಜನವಿಕಾಸ್ AI ಗೆ ಸುಸ್ವಾಗತ', submit: 'ಮನವಿ ಸಲ್ಲಿಸಿ', track: 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ', mpDashboard: 'ಸಂಸದರ ಕಮಾಂಡ್ ಸೆಂಟರ್' },
  mr: { name: 'Marathi', native: 'मराठी', welcome: 'जनविकास AI मध्ये आपले स्वागत आहे', submit: 'तक्रार/मागणी नोंदवा', track: 'मागणीचा मागोवा घ्या', mpDashboard: 'खासदार कमांड सेंटर' },
  bn: { name: 'Bengali', native: 'বাংলা', welcome: 'জনবিকাশ AI-তে আপনাকে স্বাগত', submit: 'অনুরোধ জমা দিন', track: 'অনুরোধ ট্র্যাকিং', mpDashboard: 'এমপি কমান্ড সেন্টার' },
  ur: { name: 'Urdu', native: 'اردو', welcome: 'جن وکاس AI میں خوش آمدید', submit: 'درخواست جمع کریں', track: 'ٹریس کریں', mpDashboard: 'ایم پی کمانڈ سنٹر' }
};

export const CONSTITUENCIES = [
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', mandals: ['Bheemunipatnam', 'Anandapuram', 'Padmanabham', 'Pendurthi', 'Gajuwaka'] },
  { name: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', mandals: ['Kashi Vidyapith', 'Pindra', 'Harahua', 'Sewa Puri', 'Cholapur'] },
  { name: 'Bengaluru South', state: 'Karnataka', district: 'Bengaluru Urban', mandals: ['Jayanagar', 'Basavanagudi', 'Padmanabhanagar', 'BTM Layout', 'Vijayanagar'] },
  { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', mandals: ['Charminar', 'Karwan', 'Malakpet', 'Bahadurpura', 'Chandrayangutta'] },
  { name: 'Pune', state: 'Maharashtra', district: 'Pune', mandals: ['Shivajinagar', 'Kothrud', 'Hadapsar', 'Parvati', 'Pune Cantonment'] },
  { name: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur', mandals: ['Guntur East', 'Guntur West', 'Mangalagiri', 'Tadikonda', 'Pedakurapadu'] },
  { name: 'Howrah', state: 'West Bengal', district: 'Howrah', mandals: ['Howrah Central', 'Bally', 'Shibpur', 'Sankrail', 'Domjur'] },
  { name: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', mandals: ['Coimbatore North', 'Coimbatore South', 'Singanallur', 'Kavundampalayam'] },
  { name: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', mandals: ['Lucknow West', 'Lucknow North', 'Lucknow East', 'Alambagh', 'Ch चौक'] }
];

export const INITIAL_REQUESTS: CitizenRequest[] = [
  {
    id: 'JV-2026-6101',
    name: 'Appala Raju',
    contact: 'appala.raju@gmail.com',
    constituency: 'Visakhapatnam',
    district: 'Visakhapatnam',
    mandal: 'Bheemunipatnam',
    locality: 'Mulakuddu Village Primary School',
    category: 'Education',
    description: 'The primary school building in Mulakuddu village does not have functional toilets for girls and boys, forcing children to go outside. Also, there is a shortage of teachers leading to a high pupil-to-teacher ratio.',
    urgency: 'High',
    status: 'Submitted',
    date: '2026-07-06',
    language: 'te',
    priorityScore: 89,
    upvotes: 85,
    latitude: 17.9125,
    longitude: 83.4560,
    aiAnalysis: {
      sentiment: 'Critical',
      estimatedImpactUsers: 120,
      estimatedCostLakhs: 5.5,
      primaryNeed: 'Construction of twin separate functional toilets and appointment of additional teacher.',
      justification: 'Critical sanitation gap found in school. Active risk to female student attendance. High pupil-to-teacher ratio verified.'
    },
    verifiedGaps: ['SCHOOL_TOILET_GAP', 'SCHOOL_DRINKING_WATER_GAP', 'HIGH_PUPIL_TEACHER_RATIO'],
    scoreBreakdown: {
      sentiment: 15,
      urgency: 10,
      upvotes: 12,
      density: 2,
      antyodaya: 13,
      infraGap: 20,
      disasterRisk: 8,
      finalScore: 80
    },
    baselineData: {
      villageLgdCode: "586202",
      villageName: "Mulakuddu",
      mandalName: "Bheemunipatnam",
      totalPopulation: 6800,
      scStPopulation: 1700,
      literacyRate: 64.5,
      schoolCode: "28130102",
      schoolName: "Mandal Parishad Primary School, Mulakuddu",
      pupilTeacherRatio: 42,
      schoolToilets: false,
      schoolWater: false,
      schoolElectricity: true,
      totalHouseholds: 1400,
      tapConnectionsPercentage: 28.4,
      waterQualityStatus: "High Fluoride"
    }
  },
  {
    id: 'JV-2026-6102',
    name: 'Lakshmi Devi',
    contact: '+91 94901 28312',
    constituency: 'Visakhapatnam',
    district: 'Visakhapatnam',
    mandal: 'Bheemunipatnam',
    locality: 'Mulakuddu Village Center',
    category: 'Water',
    description: 'Our village has no direct drinking water tap connection for most households. We rely on a community borewell which has high fluoride content. Children are getting joint pains.',
    urgency: 'High',
    status: 'Prioritized',
    date: '2026-07-07',
    language: 'te',
    priorityScore: 92,
    upvotes: 120,
    latitude: 17.9125,
    longitude: 83.4560,
    aiAnalysis: {
      sentiment: 'Critical',
      estimatedImpactUsers: 1400,
      estimatedCostLakhs: 12.0,
      primaryNeed: 'JJM pipeline expansion and fluoride treatment filtration unit setup.',
      justification: 'High chemical contamination (Fluoride) in local groundwater. Severe tap connectivity gaps under Jal Jeevan Mission.'
    },
    verifiedGaps: ['LOW_TAP_CONNECTION'],
    scoreBreakdown: {
      sentiment: 15,
      urgency: 10,
      upvotes: 15,
      density: 2,
      antyodaya: 13,
      infraGap: 18,
      disasterRisk: 8,
      finalScore: 81
    },
    baselineData: {
      villageLgdCode: "586202",
      villageName: "Mulakuddu",
      mandalName: "Bheemunipatnam",
      totalPopulation: 6800,
      scStPopulation: 1700,
      literacyRate: 64.5,
      totalHouseholds: 1400,
      tapConnectionsPercentage: 28.4,
      waterQualityStatus: "High Fluoride"
    }
  },
  {
    id: 'JV-2026-9041',
    name: 'Rajesh Kumar Patel',
    contact: 'rajesh.patel92@gmail.com',
    constituency: 'Varanasi',
    district: 'Varanasi',
    mandal: 'Kashi Vidyapith',
    locality: 'Sunderpur Village Road near Primary School',
    category: 'Roads',
    description: 'The main connecting road between Sunderpur village and the highway has completely eroded due to unexpected pre-monsoon showers. Massive potholes have formed, making it extremely dangerous for school children and elderly folks. Two minor motorcycle accidents have happened in the last 48 hours.',
    urgency: 'High',
    status: 'Prioritized',
    date: '2026-07-01',
    language: 'hi',
    priorityScore: 92,
    upvotes: 145,
    latitude: 25.2902,
    longitude: 82.9739,
    aiAnalysis: {
      sentiment: 'Critical',
      estimatedImpactUsers: 3500,
      estimatedCostLakhs: 18.5,
      primaryNeed: 'Immediate asphalt resurfacing and storm water side-drain construction.',
      justification: 'High safety risk with documented accidents. Connects an active primary school. Community upvotes are in the top 5% for Varanasi.'
    }
  },
  {
    id: 'JV-2026-8812',
    name: 'Anjali Hegde',
    contact: '+91 98451 02931',
    constituency: 'Bengaluru South',
    district: 'Bengaluru Urban',
    mandal: 'BTM Layout',
    locality: '4th Cross, 7th Main, Ward 147',
    category: 'Water',
    description: 'We are receiving contaminated municipal water for the past 10 days. The water has a yellowish tint and smells of sewage, indicating a leak mixing municipal sewage lines with drinking water conduits. Complaints registered on local BBMP portal remain unaddressed.',
    urgency: 'High',
    status: 'In Progress',
    date: '2026-07-02',
    language: 'en',
    priorityScore: 89,
    upvotes: 210,
    latitude: 12.9166,
    longitude: 77.6101,
    aiAnalysis: {
      sentiment: 'Critical',
      estimatedImpactUsers: 800,
      estimatedCostLakhs: 4.2,
      primaryNeed: 'Sewer-water pipeline separation audit and local high-pressure cleaning.',
      justification: 'Critical biological health hazard. Outbreak risk of water-borne illnesses in high-density Ward 147.'
    }
  },
  {
    id: 'JV-2026-7234',
    name: 'Mohammad Ali',
    contact: '+91 91772 83944',
    constituency: 'Hyderabad',
    district: 'Hyderabad',
    mandal: 'Charminar',
    locality: 'Moghalpura Community Health Center',
    category: 'Healthcare',
    description: 'The local community health center lacks basic emergency medical equipment and does not have a pediatric doctor on duty. Patients have to travel over 8km to Osmania General Hospital even for minor emergencies. Requesting funding for basic life-support and a weekly specialized clinic.',
    urgency: 'Medium',
    status: 'Verified',
    date: '2026-07-03',
    language: 'ur',
    priorityScore: 78,
    upvotes: 112,
    latitude: 17.3616,
    longitude: 78.4747,
    aiAnalysis: {
      sentiment: 'Neutral',
      estimatedImpactUsers: 12000,
      estimatedCostLakhs: 35.0,
      primaryNeed: 'Upgradation of health sub-center to PHC standard with life support systems.',
      justification: 'Fills a major public healthcare infrastructure gap in an economically weaker urban sector.'
    }
  },
  {
    id: 'JV-2026-4519',
    name: 'K. Srinivasan',
    contact: 'srini.coimbatore@outlook.com',
    constituency: 'Coimbatore',
    district: 'Coimbatore',
    mandal: 'Singanallur',
    locality: 'Kamatchi Nagar High School',
    category: 'Digital Access',
    description: 'The government high school has a computer lab but lacks internet connectivity and updated computer terminals. Students are unable to learn digital skills or access online educational portals. Requesting setting up a High-Speed Optical Fiber link and 15 modern low-power thin clients.',
    urgency: 'Medium',
    status: 'Allocated',
    date: '2026-06-28',
    language: 'ta',
    priorityScore: 74,
    upvotes: 89,
    latitude: 11.0018,
    longitude: 77.0271,
    aiAnalysis: {
      sentiment: 'Positive',
      estimatedImpactUsers: 640,
      estimatedCostLakhs: 12.0,
      primaryNeed: 'Establishment of Digital Knowledge Hub and FTTH broadband.',
      justification: 'Highly sustainable initiative. Empowers 600+ students annually with essential digital literacy.'
    }
  },
  {
    id: 'JV-2026-3112',
    name: 'Suhas Dinkar Patil',
    contact: 'suhas.patil@rediffmail.com',
    constituency: 'Pune',
    district: 'Pune',
    mandal: 'Kothrud',
    locality: 'Shastri Nagar bus stop near Depot',
    category: 'Transport',
    description: 'Severe traffic congestion occurs during evening peak hours from 5:30 PM to 8:30 PM at the Shastri Nagar bottleneck. There is a lack of pedestrian crossing signals and zebra crossings, posing high risks for commuters. Need dynamic street-light installations and a small pedestrian overpass or smart signal cycle.',
    urgency: 'Medium',
    status: 'Submitted',
    date: '2026-07-04',
    language: 'mr',
    priorityScore: 68,
    upvotes: 74,
    latitude: 18.5074,
    longitude: 73.8077,
    aiAnalysis: {
      sentiment: 'Neutral',
      estimatedImpactUsers: 15000,
      estimatedCostLakhs: 48.0,
      primaryNeed: 'Zebra crossing repaint, smart traffic signal adjustment, and pedestrian island.',
      justification: 'High density traffic hotspot. Medium term development requiring traffic police and municipal coordination.'
    }
  },
  {
    id: 'JV-2026-1102',
    name: 'Srinivasula Reddy',
    contact: 'sri.reddy.guntur@gmail.com',
    constituency: 'Guntur',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    locality: 'Atmakuru Farmers Cooperative Center',
    category: 'Agriculture',
    description: 'Farmers of Atmakuru need a solar-powered cold storage unit to preserve tomato and chili crops during seasonal bumper harvests. Currently, over 25% of crops rot before reaching the Guntur Mirchi Yard due to temperature drops or lack of local storage. This forces panic selling at extremely low rates.',
    urgency: 'High',
    status: 'Prioritized',
    date: '2026-06-29',
    language: 'te',
    priorityScore: 94,
    upvotes: 320,
    latitude: 16.4354,
    longitude: 80.5614,
    aiAnalysis: {
      sentiment: 'Critical',
      estimatedImpactUsers: 1200,
      estimatedCostLakhs: 25.0,
      primaryNeed: '50 Metric Ton Solar Cold Storage facility installation.',
      justification: 'Direct economic boost to smallholders. Minimizes harvest wastage, stabilizing market supply and farmers earnings.'
    }
  },
  {
    id: 'JV-2026-5509',
    name: 'Priyanka Mukherjee',
    contact: 'priya.mukh.howrah@yahoo.com',
    constituency: 'Howrah',
    district: 'Howrah',
    mandal: 'Shibpur',
    locality: 'Shibpur Girls School Playground Area',
    category: 'Sanitation',
    description: 'There are no functional public female toilets near the Shibpur marketplace and public playground. Women vendors, shoppers, and students face tremendous hardships. Requesting a clean, automated e-toilet complex with regular water supply and local self-help group maintenance.',
    urgency: 'High',
    status: 'Completed',
    date: '2026-06-15',
    language: 'bn',
    priorityScore: 88,
    upvotes: 245,
    latitude: 22.5694,
    longitude: 88.3182,
    aiAnalysis: {
      sentiment: 'Critical',
      estimatedImpactUsers: 4500,
      estimatedCostLakhs: 8.5,
      primaryNeed: 'Dual automated smart e-toilets with water reclamation and solar lighting.',
      justification: 'Core public hygiene and women security issue in a highly commercial hub.'
    }
  },
  {
    id: 'JV-2026-1288',
    name: 'Ramesh Chandra Mishra',
    contact: '+91 94152 77810',
    constituency: 'Lucknow',
    district: 'Lucknow',
    mandal: 'Lucknow East',
    locality: 'Gomti Riverfront Slum Rehabilitation Area',
    category: 'Education',
    description: 'Over 150 kids in this resettlement colony do not attend any formal school. A small informal non-formal study center runs under a plastic shed. We need a permanent pre-fabricated primary school building or a designated Anganwadi-cum-learning center with basic furniture and textbooks.',
    urgency: 'High',
    status: 'Allocated',
    date: '2026-06-27',
    language: 'hi',
    priorityScore: 85,
    upvotes: 198,
    latitude: 26.8500,
    longitude: 80.9500,
    aiAnalysis: {
      sentiment: 'Neutral',
      estimatedImpactUsers: 180,
      estimatedCostLakhs: 15.0,
      primaryNeed: 'Prefabricated 3-classroom Anganwadi & Basic Learning Center setup.',
      justification: 'Addresses severe educational inequality in marginalized communities. Highly efficient prefabricated structure can be built in under 6 weeks.'
    }
  },
  {
    id: 'JV-2026-2245',
    name: 'Baldev Singh',
    contact: 'baldev.singh.pindra@gmail.com',
    constituency: 'Varanasi',
    district: 'Varanasi',
    mandal: 'Pindra',
    locality: 'Phoolpur Farmers Wholesale Market yard',
    category: 'Employment',
    description: 'Our youth are migrating to distant cities for basic manual work. There is an urgent need to build a modern skill development/vocational training institute here in Pindra. Courses in digital tailoring, food processing, and solar repair will help generate local micro-employment.',
    urgency: 'Medium',
    status: 'Submitted',
    date: '2026-07-04',
    language: 'hi',
    priorityScore: 71,
    upvotes: 93,
    latitude: 25.4851,
    longitude: 82.8596,
    aiAnalysis: {
      sentiment: 'Neutral',
      estimatedImpactUsers: 2500,
      estimatedCostLakhs: 42.0,
      primaryNeed: 'MPLAD funded Multipurpose Skill Center with industrial tie-ups.',
      justification: 'Addresses regional unemployment and reduces rural migration. Medium financial layout with high social dividend.'
    }
  }
];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'REC-001',
    title: 'Atmakuru Solar Cold Storage Facility',
    category: 'Agriculture',
    constituency: 'Guntur',
    district: 'Guntur',
    priorityScore: 94,
    demandLevel: 'Very High',
    estimatedImpact: 'Saves 2,500 tons of chili and tomato crops annually, raising local farmer household income by an estimated 28%.',
    estimatedCostLakhs: 25.0,
    reason: 'Massive local farmer upvotes (320+), immediate economic return on investment, aligns with green energy initiatives, and directly prevents agricultural decay.',
    relatedRequestCount: 4,
    suggestedMPAction: 'Sanction ₹25 Lakhs from MPLADS Fund. Recommend site approval to AP State Agriculture Marketing Board.',
    timelineMonths: 4
  },
  {
    id: 'REC-002',
    title: 'Sunderpur Highway Connection Road & Drainage Upgrade',
    category: 'Roads',
    constituency: 'Varanasi',
    district: 'Varanasi',
    priorityScore: 92,
    demandLevel: 'Very High',
    estimatedImpact: 'Restores safe daily mobility for 3,500+ rural residents, eliminating mud water bottlenecks and preventing motorcycle skidding.',
    estimatedCostLakhs: 18.5,
    reason: 'Identified as a critical hazard risk with high safety concerns (school children commuting daily). High upvotes and critical local sentiment detected.',
    relatedRequestCount: 6,
    suggestedMPAction: 'Approve special emergency grant under Kashi Rural Connectivity Scheme. Allocate construction bid.',
    timelineMonths: 2
  },
  {
    id: 'REC-003',
    title: 'Ward 147 Water Line Audit & Sewage Segregation',
    category: 'Water',
    constituency: 'Bengaluru South',
    district: 'Bengaluru Urban',
    priorityScore: 89,
    demandLevel: 'High',
    estimatedImpact: 'Ensures cholera-free potable tap water for 800+ families. Reduces health clinics pressure.',
    estimatedCostLakhs: 4.2,
    reason: 'Direct water pollution hazard in high density area. AI sentiment analysis triggered an emergency priority due to public health threat.',
    relatedRequestCount: 3,
    suggestedMPAction: 'Issue immediate emergency show-cause notice to BWSSB Water Engineers. Direct immediate sewer line diagnostic.',
    timelineMonths: 1
  },
  {
    id: 'REC-004',
    title: 'Gomti Riverfront Prefabricated Primary School',
    category: 'Education',
    constituency: 'Lucknow',
    district: 'Lucknow',
    priorityScore: 85,
    demandLevel: 'High',
    estimatedImpact: 'Integrates 150+ marginalized children into formal literacy. Prevents teenage dropouts and labor risks.',
    estimatedCostLakhs: 15.0,
    reason: 'High-leverage socio-educational impact. Low cost pre-fabricated structure provides rapid deployment to counter localized absolute zero school access.',
    relatedRequestCount: 2,
    suggestedMPAction: 'Authorize ₹15 Lakhs special educational grant. Appoint 2 contract primary educators in collaboration with Basic Shiksha Adhikari.',
    timelineMonths: 3
  },
  {
    id: 'REC-005',
    title: 'Moghalpura Community Health Center Life Support Upgrade',
    category: 'Healthcare',
    constituency: 'Hyderabad',
    district: 'Hyderabad',
    priorityScore: 78,
    demandLevel: 'Medium',
    estimatedImpact: 'Caters to 12,000+ local urban poor. Lowers mortality rates by providing immediate local stabilization before Osmania hospital referral.',
    estimatedCostLakhs: 35.0,
    reason: 'Relieves congested regional government hospital. Bridges the geographical gap for emergency trauma care in the Old City.',
    relatedRequestCount: 5,
    suggestedMPAction: 'Allocate MPLAD funds for life support equipment. Request Telangana Health Department to depute a pediatrician.',
    timelineMonths: 6
  }
];

export const PROPOSAL_COMPARISONS: ProposalComparison[] = [
  {
    id: 'COMP-101',
    titleA: 'Sunderpur Road Asphalt Resurfacing & Drainage',
    titleB: 'Pindra Vocational Skill & Digital Training Center',
    category: 'Roads',
    constituency: 'Varanasi',
    metrics: [
      { label: 'Citizen Demand (Upvotes)', valueA: '145 votes (Urgent)', valueB: '93 votes (Progressive)', better: 'A' },
      { label: 'Emergency Safety Risk', valueA: 'Very High (Recent minor accidents)', valueB: 'Low (Long term economic need)', better: 'A' },
      { label: 'Beneficiaries Served', valueA: '3,500 daily commuters', valueB: '350 youth per batch', better: 'A' },
      { label: 'Estimated Project Cost', valueA: '₹18.5 Lakhs', valueB: '₹42.0 Lakhs', better: 'A' },
      { label: 'Implementation Timeline', valueA: '2 Months (Fast)', valueB: '8 Months (Medium)', better: 'A' },
      { label: 'Infrastructure Lifecycle', valueA: '5-7 Years (Needs re-layers)', valueB: '15-20 Years (Permanent asset)', better: 'B' }
    ],
    aiRecommendation: 'Recommend prioritizing Sunderpur Road (Project A) for immediate sanction. While Project B (Skill Center) is highly progressive, Sunderpur road presents an active hazard, low cost, and fast execution cycle. Project B can be cataloged for the Q3 financial budget allocations.',
    finalChoice: 'A'
  },
  {
    id: 'COMP-102',
    titleA: 'Atmakuru 50MT Solar Cold Storage',
    titleB: 'Mangalagiri Farmer Cooperative Transport Trucks',
    category: 'Agriculture',
    constituency: 'Guntur',
    metrics: [
      { label: 'Citizen Demand (Upvotes)', valueA: '320 votes (Critical)', valueB: '102 votes', better: 'A' },
      { label: 'Crop Spoilage Mitigation', valueA: 'Excellent (Protects delicate tomatoes/chilis)', valueB: 'Moderate (Still subject to road blocks)', better: 'A' },
      { label: 'Beneficiaries Served', valueA: '1,200 small farmers', valueB: '300 cooperative members', better: 'A' },
      { label: 'Estimated Project Cost', valueA: '₹25.0 Lakhs', valueB: '₹32.0 Lakhs', better: 'A' },
      { label: 'Carbon footprint & Savings', valueA: 'Solar-powered (Net Zero operation)', valueB: 'Diesel trucks (High emissions & fuel fuel cost)', better: 'A' },
      { label: 'Payback/Self-Sustainability', valueA: 'High (Small rental model)', valueB: 'Medium (Maintenance is heavy)', better: 'A' }
    ],
    aiRecommendation: 'Recommend prioritizing Solar Cold Storage (Project A). It solves the root cause of food decay locally at a lower cost, is environmentally sustainable, and enjoys triple the citizen mandate compared to buying custom diesel trucks.',
    finalChoice: 'A'
  }
];

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; icon: string }> = {
  Education: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'GraduationCap' },
  Roads: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: 'Milestone' },
  Healthcare: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'HeartPulse' },
  Water: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: 'Droplets' },
  Sanitation: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: 'Trash2' },
  Employment: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'Briefcase' },
  Transport: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'Bus' },
  Agriculture: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', icon: 'Sprout' },
  'Digital Access': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: 'Wifi' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'HelpCircle' }
};

export const HOTSPOTS = [
  { constituency: 'Guntur', count: 18, lat: 16.3067, lng: 80.4365, primaryCategory: 'Agriculture', status: 'Active' },
  { constituency: 'Varanasi', count: 24, lat: 25.3176, lng: 82.9739, primaryCategory: 'Roads', status: 'Critical' },
  { constituency: 'Bengaluru South', count: 15, lat: 12.9716, lng: 77.5946, primaryCategory: 'Water', status: 'Critical' },
  { constituency: 'Hyderabad', count: 12, lat: 17.3850, lng: 78.4867, primaryCategory: 'Healthcare', status: 'Active' },
  { constituency: 'Pune', count: 9, lat: 18.5204, lng: 73.8567, primaryCategory: 'Transport', status: 'Normal' },
  { constituency: 'Howrah', count: 11, lat: 22.5958, lng: 88.2636, primaryCategory: 'Sanitation', status: 'Active' },
  { constituency: 'Coimbatore', count: 7, lat: 11.0168, lng: 76.9558, primaryCategory: 'Digital Access', status: 'Normal' },
  { constituency: 'Lucknow', count: 14, lat: 26.8467, lng: 80.9462, primaryCategory: 'Education', status: 'Active' }
];
