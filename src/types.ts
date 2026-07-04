export interface WeatherAdvisory {
  zone: string;
  temp: number;
  condition: string;
  wind: string;
  humidity: number;
  alerts: string[];
}

export interface AQIReport {
  zone: string;
  value: number;
  status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  pollutant: string;
  details: string;
}

export interface MunicipalNotice {
  id: string;
  category: 'Infrastructure' | 'Water' | 'Power' | 'Health' | 'Other';
  title: string;
  details: string;
  schedule: string;
  status: 'Active' | 'Upcoming' | 'Resolved';
  date: string;
}

export interface CitizenReport {
  id: string;
  category: 'Water' | 'Roads' | 'Power' | 'Hazard' | 'Pollution' | 'Other';
  title: string;
  description: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  createdAt: string;
  upvotes: number;
  status: 'Pending' | 'Verifying' | 'Action Taken' | 'Resolved';
}

export interface WaterSchedule {
  zone: string;
  days: string;
  hours: string;
  notes: string;
}

export interface LocalData {
  weather: WeatherAdvisory[];
  aqi: AQIReport[];
  notices: MunicipalNotice[];
  citizenReports: CitizenReport[];
  waterSchedules: WaterSchedule[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
}
