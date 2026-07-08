import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_REQUESTS } from './src/mockData';
import { CitizenRequest, RequestStatus, Category, Urgency } from './src/types';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://janvikas-ai.vercel.app'
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in environment variables.');
}
const ai = new GoogleGenAI({ apiKey });

// Ensure DB file exists
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'requests.json');

const DEMOGRAPHICS_PATH = path.resolve(DB_DIR, 'demographics_census.json');
const SCHOOLS_PATH = path.resolve(DB_DIR, 'schools_udise.json');
const HEALTHCARE_PATH = path.resolve(DB_DIR, 'healthcare_hfr.json');
const WATER_PATH = path.resolve(DB_DIR, 'water_jjm.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  console.log('Database file not found. Seeding initial requests...');
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_REQUESTS, null, 2), 'utf8');
}

// Load baseline seed files
const demographicsData = JSON.parse(fs.readFileSync(DEMOGRAPHICS_PATH, 'utf8'));
const schoolsData = JSON.parse(fs.readFileSync(SCHOOLS_PATH, 'utf8'));
const healthcareData = JSON.parse(fs.readFileSync(HEALTHCARE_PATH, 'utf8'));
const waterData = JSON.parse(fs.readFileSync(WATER_PATH, 'utf8'));

// Weighted Priority Scoring & LGD verification helper
function calculatePriorityAndMetrics(
  latitude: number | undefined,
  longitude: number | undefined,
  locality: string | undefined,
  mandal: string | undefined,
  category: Category,
  urgency: Urgency,
  upvotes: number,
  sentiment: 'Positive' | 'Neutral' | 'Critical'
) {
  // 1. Resolve matching village/LGD record in target constituency Visakhapatnam
  let matchingVillage = demographicsData.find((d: any) => 
    (locality || '').toLowerCase().includes(d.villageName.toLowerCase()) ||
    d.villageName.toLowerCase().includes((locality || '').toLowerCase())
  );
  
  if (!matchingVillage && mandal) {
    matchingVillage = demographicsData.find((d: any) => 
      d.mandalName.toLowerCase().includes(mandal.toLowerCase()) ||
      mandal.toLowerCase().includes(d.mandalName.toLowerCase())
    );
  }
  
  // Fallback if no exact match is found
  if (!matchingVillage) {
    matchingVillage = demographicsData[0];
  }

  const lgdCode = matchingVillage.villageLgdCode;

  // 2. Fetch associated baseline records
  const villageSchools = schoolsData.filter((s: any) => s.villageLgdCode === lgdCode);
  const villageWater = waterData.find((w: any) => w.villageLgdCode === lgdCode);

  // Healthcare distance calculation (find closest HFR facility)
  let nearestFacility: any = null;
  let minDistance = Infinity;
  const userLat = latitude || 17.89;
  const userLng = longitude || 83.44;

  for (const facility of healthcareData) {
    const dist = Math.sqrt(
      Math.pow(facility.latitude - userLat, 2) + 
      Math.pow(facility.longitude - userLng, 2)
    ) * 111; // Appx degree to KM conversion
    if (dist < minDistance) {
      minDistance = dist;
      nearestFacility = facility;
    }
  }

  // 3. Identify verified gaps & compute gap score
  const verifiedGaps: string[] = [];
  let infraGapPoints = 0;

  if (category === 'Education') {
    if (villageSchools.length > 0) {
      const school = villageSchools[0];
      if (!school.hasToilets) {
        verifiedGaps.push('SCHOOL_TOILET_GAP');
        infraGapPoints += 40;
      }
      if (!school.hasDrinkingWater) {
        verifiedGaps.push('SCHOOL_DRINKING_WATER_GAP');
        infraGapPoints += 30;
      }
      if (school.pupilTeacherRatio > 30) {
        verifiedGaps.push('HIGH_PUPIL_TEACHER_RATIO');
        infraGapPoints += 30;
      }
    } else {
      verifiedGaps.push('SCHOOL_ACCESS_GAP');
      infraGapPoints = 80;
    }
  } else if (category === 'Water' || category === 'Sanitation') {
    if (villageWater) {
      if (villageWater.tapConnectionsPercentage < 50) {
        verifiedGaps.push('LOW_TAP_CONNECTION');
        infraGapPoints += 50;
      }
      if (villageWater.waterQualityStatus !== 'Safe') {
        verifiedGaps.push('WATER_QUALITY_HAZARD');
        infraGapPoints += 50;
      }
    } else {
      verifiedGaps.push('WATER_GRID_GAP');
      infraGapPoints = 75;
    }
  } else if (category === 'Healthcare') {
    if (nearestFacility) {
      if (minDistance > 5) {
        verifiedGaps.push('HEALTHCARE_ACCESSIBILITY_GAP');
        infraGapPoints += 50;
      }
      if (nearestFacility.bedsCount < 10 || nearestFacility.doctorsCount < 2) {
        verifiedGaps.push('LOW_HEALTHCARE_CAPACITY');
        infraGapPoints += 50;
      }
    } else {
      verifiedGaps.push('HEALTHCARE_GRID_GAP');
      infraGapPoints = 80;
    }
  } else {
    // Default fallback based on literacy rate
    if (matchingVillage.literacyRate < 65) {
      verifiedGaps.push('LOW_LITERACY_ZONE');
      infraGapPoints += 40;
    }
  }

  // Antyodaya / Demographics Gaps check
  const scStPercentage = (matchingVillage.scStPopulation / matchingVillage.totalPopulation) * 100;
  if (scStPercentage > 20) {
    verifiedGaps.push('HIGH_SC_ST_NEED');
  }

  const infraGapScore = Math.min(infraGapPoints || 40, 100);

  // 4. Calculate score components (weights sum to 100%)
  // Sentiment (15% weight)
  const sentimentScore = sentiment === 'Critical' ? 100 : sentiment === 'Neutral' ? 50 : 20;

  // Urgency (10% weight)
  const urgencyScore = urgency === 'High' ? 100 : urgency === 'Medium' ? 60 : 30;

  // Upvotes (15% weight)
  const upvotesScore = Math.min(50 + upvotes * 5, 100);

  // Density (15% weight)
  const densityScore = Math.min((matchingVillage.totalPopulation / 68900) * 100, 100);

  // Antyodaya (15% weight)
  const literacyGapScore = 100 - matchingVillage.literacyRate;
  const antyodayaScore = Math.min(
    (scStPercentage / 30) * 50 + (literacyGapScore / 42) * 50,
    100
  );

  // Disaster Risk (10% weight)
  let disasterScore = 30;
  const vName = matchingVillage.villageName.toLowerCase();
  if (vName.includes('bheemili') || vName.includes('bheemunipatnam') || vName.includes('mulakuddu') || vName.includes('rushikonda')) {
    disasterScore = 80; // Coastal flood risk
  } else if (vName.includes('padmanabham')) {
    disasterScore = 50; // Drought/water scarcity risk
  }

  const finalScore = Math.round(
    sentimentScore * 0.15 +
    urgencyScore * 0.10 +
    upvotesScore * 0.15 +
    densityScore * 0.15 +
    antyodayaScore * 0.15 +
    infraGapScore * 0.20 +
    disasterScore * 0.10
  );

  const scoreBreakdown = {
    sentiment: Math.round(sentimentScore * 0.15 * 10) / 10,
    urgency: Math.round(urgencyScore * 0.10 * 10) / 10,
    upvotes: Math.round(upvotesScore * 0.15 * 10) / 10,
    density: Math.round(densityScore * 0.15 * 10) / 10,
    antyodaya: Math.round(antyodayaScore * 0.15 * 10) / 10,
    infraGap: Math.round(infraGapScore * 0.20 * 10) / 10,
    disasterRisk: Math.round(disasterScore * 0.10 * 10) / 10,
    finalScore
  };

  const baselineData = {
    villageLgdCode: lgdCode,
    villageName: matchingVillage.villageName,
    mandalName: matchingVillage.mandalName,
    totalPopulation: matchingVillage.totalPopulation,
    scStPopulation: matchingVillage.scStPopulation,
    literacyRate: matchingVillage.literacyRate,
    schoolCode: villageSchools[0]?.schoolCode,
    schoolName: villageSchools[0]?.schoolName,
    pupilTeacherRatio: villageSchools[0]?.pupilTeacherRatio,
    schoolToilets: villageSchools[0]?.hasToilets,
    schoolWater: villageSchools[0]?.hasDrinkingWater,
    schoolElectricity: villageSchools[0]?.hasElectricity,
    nearestFacilityName: nearestFacility?.facilityName,
    nearestFacilityType: nearestFacility?.facilityType,
    nearestFacilityBeds: nearestFacility?.bedsCount,
    nearestFacilityDoctors: nearestFacility?.doctorsCount,
    nearestFacilityDistanceKm: nearestFacility ? parseFloat(minDistance.toFixed(1)) : undefined,
    totalHouseholds: villageWater?.totalHouseholds,
    tapConnectionsPercentage: villageWater?.tapConnectionsPercentage,
    waterQualityStatus: villageWater?.waterQualityStatus
  };

  return { baselineData, verifiedGaps, scoreBreakdown };
}

// DB Helper functions
function getRequests(): CitizenRequest[] {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data) as CitizenRequest[];
  } catch (error) {
    console.error('Error reading database file:', error);
    return INITIAL_REQUESTS;
  }
}

function saveRequests(requests: CitizenRequest[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(requests, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// Helper: Call Gemini to prioritize/analyze a single request
async function analyzeRequestWithAI(category: Category, description: string, urgency: Urgency) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const prompt = `
    Analyze the following civic development request:
    Category: ${category}
    Urgency (user-reported): ${urgency}
    Description: "${description}"

    Perform a deep priority evaluation and return a structured JSON response.
    Determine:
    1. Sentiment: Can be 'Positive', 'Neutral', or 'Critical'. Sentiment is 'Critical' if there's an active safety risk, health hazard, or emergency.
    2. Priority Score: An integer from 0 to 100 based on safety impact, beneficiary density, and infrastructure urgency.
    3. Estimated Cost (Lakhs of Rupees): A realistic projection between 1.0 and 100.0 Lakhs.
    4. Estimated Impact (Users): Number of citizens directly benefiting.
    5. Primary Need: A short summary of the engineering/construction required.
    6. Justification: A detailed 2-3 sentence logical justification explaining the score.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          sentiment: { type: 'STRING', enum: ['Positive', 'Neutral', 'Critical'] },
          priorityScore: { type: 'INTEGER' },
          estimatedCostLakhs: { type: 'NUMBER' },
          estimatedImpactUsers: { type: 'INTEGER' },
          primaryNeed: { type: 'STRING' },
          justification: { type: 'STRING' }
        },
        required: ['sentiment', 'priorityScore', 'estimatedCostLakhs', 'estimatedImpactUsers', 'primaryNeed', 'justification']
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response received from Gemini');
  }
  return JSON.parse(text);
}

// Routes
// 1. Fetch all requests
app.get('/api/requests', (req, res) => {
  res.json(getRequests());
});

// 2. Submit a request (analyzed dynamically by Gemini)
app.post('/api/requests', async (req, res) => {
  try {
    const {
      name,
      contact,
      constituency,
      district,
      mandal,
      locality,
      category,
      description,
      urgency,
      latitude,
      longitude,
      language
    } = req.body;

    if (!name || !description || !contact) {
      res.status(400).json({ error: 'Name, contact, and description are required.' });
      return;
    }

    console.log(`Analyzing new request for category: ${category}...`);
    
    // Analyze using Gemini, fallback to simulation if API fails or is unconfigured
    let aiAnalysis;
    let priorityScore = 50;

    try {
      const result = await analyzeRequestWithAI(category, description, urgency);
      aiAnalysis = result;
      priorityScore = result.priorityScore;
    } catch (apiError) {
      console.warn('AI analysis API call failed, falling back to simulation:', apiError);
      const isCritical = description.toLowerCase().includes('accident') || description.toLowerCase().includes('danger') || description.toLowerCase().includes('leak');
      aiAnalysis = {
        sentiment: isCritical ? 'Critical' : 'Neutral',
        estimatedImpactUsers: Math.floor(100 + Math.random() * 1000),
        estimatedCostLakhs: urgency === 'High' ? 25.0 : 10.0,
        primaryNeed: `Address local ${category} requirements.`,
        justification: 'Simulated AI Analysis (Gemini connection offline).'
      };
      priorityScore = urgency === 'High' ? 85 : urgency === 'Medium' ? 60 : 35;
    }

    // Dynamic join, verified gaps, and weighted priority scoring calculations
    const stats = calculatePriorityAndMetrics(
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
      locality,
      mandal,
      category,
      urgency,
      1, // start upvotes
      aiAnalysis.sentiment
    );

    const mockId = `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: CitizenRequest = {
      id: mockId,
      name,
      contact,
      constituency,
      district,
      mandal,
      locality: locality || 'Main Ward',
      category,
      description,
      urgency,
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
      language: language || 'en',
      priorityScore: stats.scoreBreakdown.finalScore,
      upvotes: 1,
      latitude: latitude ? parseFloat(latitude) : 25.0,
      longitude: longitude ? parseFloat(longitude) : 82.0,
      aiAnalysis,
      scoreBreakdown: stats.scoreBreakdown,
      verifiedGaps: stats.verifiedGaps,
      baselineData: stats.baselineData
    };

    const requests = getRequests();
    requests.unshift(newRequest);
    saveRequests(requests);

    res.status(201).json(newRequest);
  } catch (err: any) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// 3. Upvote a request
app.post('/api/upvote', (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: 'Request ID is required' });
    return;
  }

  const requests = getRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  const reqObj = requests[index];
  const updatedUpvotes = reqObj.upvotes + 1;
  reqObj.upvotes = updatedUpvotes;

  // Recalculate dynamic priority score
  const sentimentVal = reqObj.aiAnalysis ? reqObj.aiAnalysis.sentiment : 'Neutral';
  const stats = calculatePriorityAndMetrics(
    reqObj.latitude,
    reqObj.longitude,
    reqObj.locality,
    reqObj.mandal,
    reqObj.category,
    reqObj.urgency,
    reqObj.upvotes,
    sentimentVal
  );

  reqObj.scoreBreakdown = stats.scoreBreakdown;
  reqObj.priorityScore = stats.scoreBreakdown.finalScore;

  saveRequests(requests);
  res.json(reqObj);
});


// 4. Update status
app.post('/api/status', (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) {
    res.status(400).json({ error: 'ID and Status are required' });
    return;
  }

  const requests = getRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  requests[index].status = status as RequestStatus;
  saveRequests(requests);
  res.json(requests[index]);
});

// 5. Explicit prioritize check for the form
app.post('/api/prioritize', async (req, res) => {
  try {
    const { category, description, urgency, latitude, longitude, locality, mandal } = req.body;
    if (!description) {
      res.status(400).json({ error: 'Description is required.' });
      return;
    }
    const aiResult = await analyzeRequestWithAI(category, description, urgency);
    
    // Calculate local data validations and priority
    const metrics = calculatePriorityAndMetrics(
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
      locality,
      mandal,
      category,
      urgency,
      1, // upvote base count
      aiResult.sentiment
    );

    res.json({
      ...aiResult,
      priorityScore: metrics.scoreBreakdown.finalScore,
      scoreBreakdown: metrics.scoreBreakdown,
      verifiedGaps: metrics.verifiedGaps,
      baselineData: metrics.baselineData
    });
  } catch (err: any) {
    console.error('Error running AI prioritizer:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// 6. Dynamic Recommendations endpoint
app.get('/api/recommendations', async (req, res) => {
  try {
    const requests = getRequests();
    if (requests.length === 0) {
      res.json([]);
      return;
    }

    console.log('Generating dynamic AI recommendations from database...');

    const prompt = `
      You are JanVikas AI, a civic priority recommendation engine for Members of Parliament.
      Below is the list of active citizen development requests in the constituency.
      Analyze their descriptions, categories, upvotes, coordinates, and urgency to group related demands and generate exactly 3 to 5 high-leverage prioritized Recommendations.

      Citizen Requests:
      ${JSON.stringify(requests.map(r => ({
        id: r.id,
        category: r.category,
        urgency: r.urgency,
        upvotes: r.upvotes,
        description: r.description,
        constituency: r.constituency,
        district: r.district,
        verifiedGaps: r.verifiedGaps || [],
        populationServed: r.baselineData?.totalPopulation || 500
      })), null, 2)}

      Output a JSON list of AIRecommendation objects. Each object must strictly match this structure:
      {
        "id": "REC-001", // incrementing REC-001, REC-002, etc.
        "title": "Short descriptive title of the recommendation project",
        "category": "Must be one of: 'Education' | 'Roads' | 'Healthcare' | 'Water' | 'Sanitation' | 'Employment' | 'Transport' | 'Agriculture' | 'Digital Access' | 'Other'",
        "constituency": "Constituency name",
        "district": "District name",
        "priorityScore": 85, // 0-100 average priority score
        "demandLevel": "Very High" | "High" | "Medium",
        "estimatedImpact": "Explanation of direct user impact and statistics",
        "estimatedCostLakhs": 25.5, // Float estimated outlay
        "reason": "Detailed justification explaining why this project is recommended and how it groups the related citizen complaints",
        "relatedRequestCount": 3, // Count of requests this project resolves
        "suggestedMPAction": "Clear suggestion of MP action under MPLADS rules",
        "timelineMonths": 3, // Target project execution timeline in months
        "verifiedGaps": ["SCHOOL_TOILET_GAP", "LOW_TAP_CONNECTION"], // Array of verified gaps this addresses
        "totalPopulationServed": 4500, // Total estimated population direct/indirect beneficiaries
        "baselineSummary": "Short 1-sentence summary of school/water baseline data that justified this project"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'STRING' },
              title: { type: 'STRING' },
              category: { type: 'STRING' },
              constituency: { type: 'STRING' },
              district: { type: 'STRING' },
              priorityScore: { type: 'INTEGER' },
              demandLevel: { type: 'STRING', enum: ['Very High', 'High', 'Medium'] },
              estimatedImpact: { type: 'STRING' },
              estimatedCostLakhs: { type: 'NUMBER' },
              reason: { type: 'STRING' },
              relatedRequestCount: { type: 'INTEGER' },
              suggestedMPAction: { type: 'STRING' },
              timelineMonths: { type: 'INTEGER' },
              verifiedGaps: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              totalPopulationServed: { type: 'INTEGER' },
              baselineSummary: { type: 'STRING' }
            },
            required: [
              'id', 'title', 'category', 'constituency', 'district', 'priorityScore', 
              'demandLevel', 'estimatedImpact', 'estimatedCostLakhs', 'reason', 
              'relatedRequestCount', 'suggestedMPAction', 'timelineMonths',
              'verifiedGaps', 'totalPopulationServed', 'baselineSummary'
            ]
          }
        }
      }
    });

    const text = response.text;
    res.json(JSON.parse(text || '[]'));
  } catch (err: any) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// 7. Dynamic Proposal Comparison endpoint
app.post('/api/compare', async (req, res) => {
  try {
    const { idA, idB } = req.body;
    if (!idA || !idB) {
      res.status(400).json({ error: 'Both idA and idB are required' });
      return;
    }

    const requests = getRequests();
    const reqA = requests.find(r => r.id === idA);
    const reqB = requests.find(r => r.id === idB);

    if (!reqA || !reqB) {
      res.status(404).json({ error: 'One or both requests not found in database' });
      return;
    }

    console.log(`Generating side-by-side comparison for ${idA} and ${idB}...`);

    const prompt = `
      Compare these two citizen development proposals side-by-side:
      Proposal A:
      ID: ${reqA.id}
      Title: Local ${reqA.category} project at ${reqA.locality}
      Category: ${reqA.category}
      Description: "${reqA.description}"
      Upvotes: ${reqA.upvotes}
      AI Priority Score: ${reqA.priorityScore}%
      Estimated Cost: ₹${reqA.aiAnalysis.estimatedCostLakhs} Lakhs
      Estimated Impact: ${reqA.aiAnalysis.estimatedImpactUsers} users

      Proposal B:
      ID: ${reqB.id}
      Title: Local ${reqB.category} project at ${reqB.locality}
      Category: ${reqB.category}
      Description: "${reqB.description}"
      Upvotes: ${reqB.upvotes}
      AI Priority Score: ${reqB.priorityScore}%
      Estimated Cost: ₹${reqB.aiAnalysis.estimatedCostLakhs} Lakhs
      Estimated Impact: ${reqB.aiAnalysis.estimatedImpactUsers} users

      Generate a structured JSON comparison detailing multi-criteria trade-offs. Include exactly 6 metrics inside the 'metrics' list (e.g. Demand, Cost, Timeline, Beneficiaries, Life cycle, Safety Risk).
      Return this exact JSON structure:
      {
        "id": "COMP-CUSTOM",
        "titleA": "Short project title for A",
        "titleB": "Short project title for B",
        "category": "${reqA.category}",
        "constituency": "${reqA.constituency}",
        "metrics": [
          {
            "label": "Metric Label",
            "valueA": "Value for A",
            "valueB": "Value for B",
            "better": "A" | "B" | "Equal"
          }
        ],
        "aiRecommendation": "Detailed 2-3 sentence AI advisory detailing why one is prioritized over the other.",
        "finalChoice": "A" | "B"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            titleA: { type: 'STRING' },
            titleB: { type: 'STRING' },
            category: { type: 'STRING' },
            constituency: { type: 'STRING' },
            metrics: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  label: { type: 'STRING' },
                  valueA: { type: 'STRING' },
                  valueB: { type: 'STRING' },
                  better: { type: 'STRING', enum: ['A', 'B', 'Equal'] }
                },
                required: ['label', 'valueA', 'valueB', 'better']
              }
            },
            aiRecommendation: { type: 'STRING' },
            finalChoice: { type: 'STRING', enum: ['A', 'B'] }
          },
          required: ['id', 'titleA', 'titleB', 'category', 'constituency', 'metrics', 'aiRecommendation', 'finalChoice']
        }
      }
    });

    const text = response.text;
    res.json(JSON.parse(text || '{}'));
  } catch (err: any) {
    console.error('Error comparing proposals:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Serve frontend build in production
const DIST_PATH = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(DIST_PATH, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running in production mode serving static and API on port ${PORT}`);
});
