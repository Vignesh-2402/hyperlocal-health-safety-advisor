import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Wind, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  AlertTriangle,
  Navigation
} from 'lucide-react';
import { WeatherAdvisory, AQIReport } from '../types';

const ZONE_COORDS: Record<string, { lat: number, lon: number }> = {
  'Thiruvallur': { lat: 13.1438, lon: 79.9079 },
  'Ambattur': { lat: 13.1143, lon: 80.1548 },
  'Anna Nagar': { lat: 13.0850, lon: 80.2101 },
  'Adyar': { lat: 13.0067, lon: 80.2578 },
  'Tambaram': { lat: 12.9229, lon: 80.1274 }
};

const SIMULATION_PRESETS = [
  { name: 'Thiruvallur Center', lat: 13.1438, lon: 79.9079 },
  { name: 'Ambattur Industrial', lat: 13.1143, lon: 80.1548 },
  { name: 'Anna Nagar Tower', lat: 13.0850, lon: 80.2101 },
  { name: 'Adyar Beach Coast', lat: 13.0067, lon: 80.2578 },
  { name: 'Tambaram Railway Hub', lat: 12.9229, lon: 80.1274 },
];

interface ZoneSelectorProps {
  weather: WeatherAdvisory[];
  aqi: AQIReport[];
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  onDetectLocation: () => void;
  detectingLocation: boolean;
  detectedMessage: string | null;
  liveTracking: boolean;
  onToggleLiveTracking: () => void;
  userCoords: { lat: number; lon: number } | null;
  currentSimulationName: string | null;
  onSimulateLocation: (coords: { lat: number; lon: number } | null, label: string) => void;
}

export default function ZoneSelector({ 
  weather, 
  aqi, 
  selectedZone, 
  onSelectZone,
  onDetectLocation,
  detectingLocation,
  detectedMessage,
  liveTracking,
  onToggleLiveTracking,
  userCoords,
  currentSimulationName,
  onSimulateLocation
}: ZoneSelectorProps) {

  const getAQIColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'text-teal-400 bg-teal-950/40 border-teal-500/20';
      case 'Moderate':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/20';
      case 'Unhealthy':
        return 'text-orange-400 bg-orange-950/40 border-orange-500/20';
      case 'Hazardous':
        return 'text-red-400 bg-red-950/40 border-red-500/20';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />;
      case 'breezy':
        return <Wind className="w-5 h-5 text-blue-400" />;
      case 'partly cloudy':
        return <CloudSun className="w-5 h-5 text-slate-400" />;
      default:
        return <CloudSun className="w-5 h-5 text-slate-400" />;
    }
  };

  // Haversine formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sort sectors dynamically based on distance if userCoords is available!
  const sortedWeather = [...weather].map(w => {
    const coords = ZONE_COORDS[w.zone];
    let distance: number | null = null;
    if (userCoords && coords) {
      distance = getDistance(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
    }
    return { ...w, distance };
  }).sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800/80 p-5 shadow-lg relative overflow-hidden" id="zone-selector-card">
      {/* Visual cybernetic accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <LayersIcon className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-display font-semibold text-slate-100">Hyperlocal Municipal Sectors</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Simulation Dropdown Selector */}
          <div className="flex items-center gap-1.5 bg-[#1e293b]/50 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Location Mode:</span>
            <select
              id="simulate-location-dropdown"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'live') {
                  onToggleLiveTracking();
                } else {
                  const selectedSim = SIMULATION_PRESETS.find(p => p.name === val);
                  if (selectedSim) {
                    onSimulateLocation({ lat: selectedSim.lat, lon: selectedSim.lon }, selectedSim.name);
                  }
                }
              }}
              value={liveTracking ? 'live' : (currentSimulationName || '')}
              className="bg-transparent text-xs font-semibold text-slate-300 outline-none cursor-pointer"
            >
              <option value="live" className="bg-[#0f172a] text-slate-300">📡 Live GPS Tracker</option>
              {SIMULATION_PRESETS.map(preset => (
                <option key={preset.name} value={preset.name} className="bg-[#0f172a] text-slate-300">
                  📍 Simulate: {preset.name.replace(' Center', '').replace(' Suburb', '')}
                </option>
              ))}
            </select>
          </div>

          {/* Geolocation Trigger */}
          <button
            id="geolocation-detect-btn"
            onClick={onToggleLiveTracking}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              liveTracking 
                ? 'bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/10 font-bold' 
                : detectingLocation 
                ? 'bg-[#1e293b]/40 text-slate-400 border-slate-800 animate-pulse' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300'
            }`}
            title={liveTracking ? "Live GPS auto-detection is active. Click to pause." : "Enable continuous live GPS auto-detection"}
          >
            <Navigation className={`w-3.5 h-3.5 ${liveTracking ? 'animate-bounce text-slate-950' : detectingLocation ? 'animate-spin' : ''}`} />
            <span>{liveTracking ? 'Live GPS: ON' : 'Live GPS: OFF'}</span>
          </button>

          <span className="text-xs text-slate-400 font-mono bg-[#1e293b]/30 px-2.5 py-1.5 rounded border border-slate-800">
            5 Sectors Active
          </span>
        </div>
      </div>

      {detectedMessage && (
        <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg flex items-center justify-between text-xs text-amber-300 animate-fade-in relative z-10" id="geo-status-banner">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-medium">{detectedMessage}</span>
          </div>
          <button 
            onClick={() => {
              onSelectZone('All');
              onSimulateLocation(null, '');
            }} 
            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      <p className="text-sm text-slate-400 mb-4 leading-relaxed relative z-10">
        Select a sector below or change your simulated/live location. Sectors rearrange dynamically by distance with the closest always listed first.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10" id="sectors-grid">
        {sortedWeather.map((w) => {
          const zoneAQI = aqi.find(a => a.zone === w.zone);
          const isSelected = selectedZone === w.zone;
          const hasAlerts = w.alerts && w.alerts.length > 0;

          return (
            <button
              key={w.zone}
              id={`zone-btn-${w.zone.toLowerCase().replace(' ', '-')}`}
              onClick={() => onSelectZone(w.zone)}
              className={`relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                isSelected 
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                  : 'border-slate-800/80 bg-[#1e293b]/30 hover:bg-[#1e293b]/70 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2 w-full">
                <div className="flex flex-col">
                  <span className={`font-display font-semibold text-sm ${isSelected ? 'text-amber-400' : 'text-slate-100'}`}>{w.zone}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{w.temp}°C • {w.condition}</span>
                  {w.distance !== null && (
                    <span className="text-[10px] text-amber-400 font-mono font-medium mt-1">
                      ↳ {w.distance.toFixed(1)} km away
                    </span>
                  )}
                </div>
                {getWeatherIcon(w.condition)}
              </div>

              {zoneAQI && (
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/40 w-full">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AQI</span>
                    <span className="font-mono text-xs font-semibold text-slate-300">{zoneAQI.value}</span>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getAQIColor(zoneAQI.status)}`}>
                    {zoneAQI.status}
                  </span>
                </div>
              )}

              {hasAlerts && (
                <div className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Simple inline layout helper icon for lucide-react integration
function LayersIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-10 9 10 9 10-9-10-9Z" />
      <path d="m2 17 10 3 10-3" />
      <path d="m2 12 10 3 10-3" />
    </svg>
  );
}
