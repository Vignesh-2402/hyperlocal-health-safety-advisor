import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  WeatherAdvisory, 
  AQIReport, 
  MunicipalNotice, 
  CitizenReport, 
  WaterSchedule, 
  LocalData 
} from './src/types';

// In-memory data store for the community
const weatherData: WeatherAdvisory[] = [
  {
    zone: 'Thiruvallur',
    temp: 33,
    condition: 'Humid',
    wind: '12 km/h SE',
    humidity: 75,
    alerts: []
  },
  {
    zone: 'Ambattur',
    temp: 34,
    condition: 'Hazy',
    wind: '10 km/h E',
    humidity: 70,
    alerts: []
  },
  {
    zone: 'Anna Nagar',
    temp: 32,
    condition: 'Partly Cloudy',
    wind: '14 km/h SE',
    humidity: 80,
    alerts: []
  },
  {
    zone: 'Adyar',
    temp: 30,
    condition: 'Breezy',
    wind: '22 km/h E',
    humidity: 85,
    alerts: ['Coastal High Tide Advisory: High swells expected at Marina and Elliot beaches. Secure light boats.']
  },
  {
    zone: 'Tambaram',
    temp: 33,
    condition: 'Sunny',
    wind: '8 km/h S',
    humidity: 68,
    alerts: []
  }
];

const aqiData: AQIReport[] = [
  {
    zone: 'Thiruvallur',
    value: 48,
    status: 'Good',
    pollutant: 'Ozone',
    details: 'Clean air with ample open farmlands and lake breeze.'
  },
  {
    zone: 'Ambattur',
    value: 145,
    status: 'Unhealthy',
    pollutant: 'PM2.5',
    details: 'Industrial particulate concentration high near SIDCO Industrial Estate.'
  },
  {
    zone: 'Anna Nagar',
    value: 78,
    status: 'Moderate',
    pollutant: 'PM10',
    details: 'Suspended road dust from civic road works near Tower Park.'
  },
  {
    zone: 'Adyar',
    value: 42,
    status: 'Good',
    pollutant: 'Ozone',
    details: 'Splendid coastal winds provide continuous fresh air ventilation.'
  },
  {
    zone: 'Tambaram',
    value: 85,
    status: 'Moderate',
    pollutant: 'PM2.5',
    details: 'Transit emission congestion during peak commuter hours near Tambaram station.'
  }
];

const municipalNotices: MunicipalNotice[] = [
  {
    id: 'n1',
    category: 'Water',
    title: 'CMWSSB Chembarambakkam Pipeline Maintenance',
    details: 'Scheduled valve maintenance and cleaning work at Chembarambakkam treatment facility. Water supply to all of Thiruvallur suburbs and parts of Ambattur will be interrupted.',
    schedule: 'Wednesday, July 8, 2026, from 6:00 AM to 6:00 PM',
    status: 'Upcoming',
    date: '2026-07-03'
  },
  {
    id: 'n2',
    category: 'Power',
    title: 'TANGEDCO Grid Maintenance & Substation Overhaul',
    details: 'Overhead transformer line clearances to avoid monsoon tree-spark incidents. Subdivisions of Anna Nagar West will experience periodic outages.',
    schedule: 'Tuesday, July 7, 2026, between 10:00 AM and 2:00 PM',
    status: 'Upcoming',
    date: '2026-07-03'
  },
  {
    id: 'n3',
    category: 'Infrastructure',
    title: 'National Highways Authority Road Repair - Tambaram Bypass',
    details: 'Asphalt patching and pothole repair across critical sections of Tambaram-Maduravoyal Bypass. Expect heavy traffic congestion.',
    schedule: 'Ongoing until Saturday, July 4, 2026',
    status: 'Active',
    date: '2026-07-01'
  },
  {
    id: 'n4',
    category: 'Health',
    title: 'Tamil Nadu Health Department Dengue Prevention Fogging',
    details: 'Public health workers conducting mass anti-larval spray in standing water and fogging across waterbodies. Please close open wells.',
    schedule: 'Daily, 6:00 AM - 8:30 AM',
    status: 'Active',
    date: '2026-07-02'
  }
];

const waterSchedules: WaterSchedule[] = [
  {
    zone: 'Thiruvallur',
    days: 'Monday, Wednesday, Friday',
    hours: '6:00 AM - 11:00 AM',
    notes: 'Local municipal pipeline water supply. Keep overhead tanks ready.'
  },
  {
    zone: 'Ambattur',
    days: 'Tuesday, Thursday, Saturday',
    hours: '5:00 AM - 9:00 AM',
    notes: 'Subject to minor water pressure fluctuations near industrial zones.'
  },
  {
    zone: 'Anna Nagar',
    days: 'Daily',
    hours: '6:00 AM - 8:30 AM',
    notes: 'CMWSSB Metrowater tap supply. High-altitude apartments should use booster pumps.'
  },
  {
    zone: 'Adyar',
    days: 'Daily',
    hours: '24 Hours Uninterrupted',
    notes: 'Desalination plant-linked continuous loop. High water pressure.'
  },
  {
    zone: 'Tambaram',
    days: 'Mon, Thu',
    hours: '7:00 AM - 10:00 AM',
    notes: 'Groundwater replenishment active. Supplement with rain-harvesting buffers.'
  }
];

const citizenReports: CitizenReport[] = [
  {
    id: 'cr1',
    category: 'Hazard',
    title: 'Waterlogged Pothole near Thiruvallur Collectorate',
    description: 'A massive hidden pothole filled with muddy rainwater is stalling two-wheelers. Highly risky for night riders.',
    location: 'Thiruvallur, near District Collectorate Entrance',
    severity: 'High',
    createdAt: '2026-07-03T14:30:00-07:00',
    upvotes: 38,
    status: 'Verifying'
  },
  {
    id: 'cr2',
    category: 'Water',
    title: 'CMWSSB Drinking Water Pipe Leakage',
    description: 'Fresh metrowater spraying onto the roadway due to a ruptured service joint.',
    location: 'Anna Nagar, 2nd Avenue, near Tower Park',
    severity: 'Medium',
    createdAt: '2026-07-03T09:15:00-07:00',
    upvotes: 12,
    status: 'Action Taken'
  },
  {
    id: 'cr3',
    category: 'Roads',
    title: 'Heavy Traffic Congestion near Tambaram Station',
    description: 'Stalled MTC bus is blocking two lanes of GST Road, causing severe gridlock tailing back to Perungalathur.',
    location: 'Tambaram, GST Road near Railway Station Underpass',
    severity: 'High',
    createdAt: '2026-07-03T18:45:00-07:00',
    upvotes: 57,
    status: 'Pending'
  },
  {
    id: 'cr4',
    category: 'Power',
    title: 'Dangling Low-Tension Line over walking path',
    description: 'A heavy branch fell on the electricity line, tearing the casing. Cable is dangling dangerously close to the pavement.',
    location: 'Adyar, LB Road near Kasturiba Nagar signal',
    severity: 'High',
    createdAt: '2026-07-02T08:00:00-07:00',
    upvotes: 42,
    status: 'Action Taken'
  }
];

// Lazy Gemini API Client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required but missing. Please set it in the Secrets configuration.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Get all community data
  app.get('/api/data', (req, res) => {
    const data: LocalData = {
      weather: weatherData,
      aqi: aqiData,
      notices: municipalNotices,
      citizenReports: citizenReports,
      waterSchedules: waterSchedules
    };
    res.json(data);
  });

  // API Route: Submit new citizen report
  app.post('/api/reports', (req, res) => {
    const { category, title, description, location, severity } = req.body;
    
    if (!category || !title || !description || !location || !severity) {
      return res.status(400).json({ error: 'Missing required report fields.' });
    }

    const newReport: CitizenReport = {
      id: `cr-${Date.now()}`,
      category,
      title,
      description,
      location,
      severity,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      status: 'Pending'
    };

    citizenReports.unshift(newReport);
    res.status(201).json(newReport);
  });

  // API Route: Upvote/verify a citizen report
  app.post('/api/reports/:id/verify', (req, res) => {
    const { id } = req.params;
    const report = citizenReports.find(r => r.id === id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    report.upvotes += 1;
    res.json(report);
  });

  // API Route: AI Chat with Hyperlocal Grounding (RAG)
  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array.' });
    }

    try {
      // 1. Format community data as grounding context for the prompt
      const contextSummary = `
LATEST HYPERLOCAL COMMUNITY ADVISORY DATA:

1. WEATHER & ADVISORIES BY ZONE:
${weatherData.map(w => `- Zone: ${w.zone} | Temp: ${w.temp}°F | Condition: ${w.condition} | Wind: ${w.wind} | Humidity: ${w.humidity}% | Advisories: ${w.alerts.length > 0 ? w.alerts.join('; ') : 'None'}`).join('\n')}

2. AIR QUALITY INDEX (AQI) BY ZONE:
${aqiData.map(a => `- Zone: ${a.zone} | AQI: ${a.value} (${a.status}) | Primary Pollutant: ${a.pollutant} | Advice: ${a.details}`).join('\n')}

3. OFFICIAL MUNICIPAL ANNOUNCEMENTS:
${municipalNotices.map(n => `- Title: ${n.title}\n  Category: ${n.category} | Status: ${n.status}\n  Schedule: ${n.schedule}\n  Details: ${n.details}`).join('\n\n')}

4. WATER & RESOURCE SUPPLY SCHEDULES:
${waterSchedules.map(ws => `- Zone: ${ws.zone} | Water Days: ${ws.days} | Water Hours: ${ws.hours} | Restrictions: ${ws.notes}`).join('\n')}

5. ACTIVE CITIZEN SAFETY REPORTS (CROWD-SOURCED):
${citizenReports.map(cr => `- Title: ${cr.title}\n  Category: ${cr.category} | Location: ${cr.location} | Severity: ${cr.severity} | Status: ${cr.status}\n  Description: ${cr.description} | Upvotes: ${cr.upvotes}`).join('\n\n')}
`;

      const systemInstruction = `
You are the "Local Health & Safety Advisor", an advanced AI assistant powered by Gemini. You serve citizens of this municipality, answering questions about local safety, weather, air quality, municipal work, water schedules, and crowd-sourced hazards.

CRITICAL INSTRUCTIONS:
- You must answer questions using the ground-truth hyperlocal data provided below.
- Do NOT make up any municipal announcements, air quality stats, or water schedules. Only reference what is in the data.
- If the user asks about an area, event, or incident not listed in the data, explain honestly: "I don't have an active report for that specific incident/area." Follow up by politely suggesting they can submit a crowd-sourced citizen report on the dashboard so neighbors can be warned.
- Keep your tone friendly, authoritative, supportive, and local-centric.
- Be concise but highly helpful. When answering, specifically name the zone (e.g., Thiruvallur, Ambattur, Anna Nagar, Adyar, Tambaram) and the official source or resident report.
- Bullet points, bold terms, and clear sections make your advice very readable. For example, highlight high severity hazards immediately.
- If the user asks general weather/safety questions, ground it in the current conditions: e.g., if they ask "Is it safe to jog?", check the AQI and Wind advisories for their zone (like industrial PM2.5 in Ambattur or coastal winds in Adyar) and give direct recommendations.
`;

      // Formulate query using gemini-3.5-flash
      const ai = getGeminiClient();
      
      // We will feed the conversation history along with our context to the model
      const contents = [
        {
          role: 'user' as const,
          parts: [{ text: `${systemInstruction}\n\n=== GROUNDING CONTEXT ===\n${contextSummary}\n===========================\n\nUser Question/History: Please answer the user based on the history below.` }]
        },
        ...messages.map((m: any) => ({
          role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model',
          parts: m.parts || [{ text: m.content || '' }]
        }))
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Gemini API execution error:', err);
      res.status(500).json({ error: err.message || 'An error occurred while generating safety recommendations.' });
    }
  });

  // Serve static client assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Local Advisor] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Local Advisor] Bootstrapping failed:', err);
  process.exit(1);
});
