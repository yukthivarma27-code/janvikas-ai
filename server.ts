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
const PORT = process.env.PORT || 5001;

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

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  console.log('Database file not found. Seeding initial requests...');
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_REQUESTS, null, 2), 'utf8');
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
      // Simple simulation fallback
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
      priorityScore,
      upvotes: 1,
      latitude: latitude || 25.0,
      longitude: longitude || 82.0,
      aiAnalysis
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
  const additionalScore = Math.min(Math.floor(updatedUpvotes / 10), 5);
  const originalScore = reqObj.priorityScore;
  const newScore = Math.min(originalScore + additionalScore, 98);

  reqObj.upvotes = updatedUpvotes;
  reqObj.priorityScore = newScore;

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
    const { category, description, urgency } = req.body;
    if (!description) {
      res.status(400).json({ error: 'Description is required.' });
      return;
    }
    const result = await analyzeRequestWithAI(category, description, urgency);
    res.json(result);
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
        district: r.district
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
        "timelineMonths": 3 // Target project execution timeline in months
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
              timelineMonths: { type: 'INTEGER' }
            },
            required: [
              'id', 'title', 'category', 'constituency', 'district', 'priorityScore', 
              'demandLevel', 'estimatedImpact', 'estimatedCostLakhs', 'reason', 
              'relatedRequestCount', 'suggestedMPAction', 'timelineMonths'
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
