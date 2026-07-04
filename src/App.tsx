import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Activity, 
  AlertCircle,
  ThumbsUp,
  Award,
  Sparkles,
  Info,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import ZoneSelector from './components/ZoneSelector';
import AlertsPanel from './components/AlertsPanel';
import ChatPanel from './components/ChatPanel';
import { LocalData, WeatherAdvisory, AQIReport, MunicipalNotice, CitizenReport, WaterSchedule } from './types';

export default function App() {
  const [data, setData] = useState<LocalData | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState<string>('');
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [detectedMessage, setDetectedMessage] = useState<string | null>(null);
  const [hasAutoDetected, setHasAutoDetected] = useState<boolean>(false);
  const [liveTracking, setLiveTracking] = useState<boolean>(true);
  const [userCoords, setUserCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [currentSimulationName, setCurrentSimulationName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');

  // Live clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Continuous real-time dynamic location tracking
  useEffect(() => {
    if (!liveTracking) {
      setDetectingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      setDetectedMessage("Geolocation is not supported by your browser.");
      setLiveTracking(false);
      return;
    }

    setDetectingLocation(true);

    // Coordinates of our Tamil Nadu sectors
    const sectors = [
      { name: 'Thiruvallur', lat: 13.1438, lon: 79.9079 },
      { name: 'Ambattur', lat: 13.1143, lon: 80.1548 },
      { name: 'Anna Nagar', lat: 13.0850, lon: 80.2101 },
      { name: 'Adyar', lat: 13.0067, lon: 80.2578 },
      { name: 'Tambaram', lat: 12.9229, lon: 80.1274 },
    ];

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

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        setCurrentSimulationName(null);
        
        let closestSector = sectors[0];
        let minDistance = getDistance(latitude, longitude, closestSector.lat, closestSector.lon);

        for (let i = 1; i < sectors.length; i++) {
          const d = getDistance(latitude, longitude, sectors[i].lat, sectors[i].lon);
          if (d < minDistance) {
            minDistance = d;
            closestSector = sectors[i];
          }
        }

        setSelectedZone(closestSector.name);

        if (minDistance > 100) {
          setDetectedMessage(
            `Live coordinates: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°. Since you are outside our prime coverage, we matched you to the nearest sector: ${closestSector.name} (${minDistance.toFixed(0)} km away).`
          );
        } else {
          setDetectedMessage(
            `Located near ${closestSector.name} (~${minDistance.toFixed(1)} km away). Sector updated dynamically via Live GPS Sync!`
          );
        }
        setDetectingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Could not access location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please verify your browser/device permissions.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location signal is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        setDetectedMessage(errorMsg);
        setDetectingLocation(false);
        setLiveTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setDetectingLocation(false);
    };
  }, [liveTracking]);

  const handleDetectLocation = () => {
    setLiveTracking(prev => !prev);
  };

  const handleSimulateLocation = (coords: { lat: number, lon: number } | null, label: string) => {
    setLiveTracking(false);
    if (!coords) {
      setUserCoords(null);
      setCurrentSimulationName(null);
      setSelectedZone('All');
      setDetectedMessage(null);
      return;
    }

    setUserCoords(coords);
    setCurrentSimulationName(label);

    const sectors = [
      { name: 'Thiruvallur', lat: 13.1438, lon: 79.9079 },
      { name: 'Ambattur', lat: 13.1143, lon: 80.1548 },
      { name: 'Anna Nagar', lat: 13.0850, lon: 80.2101 },
      { name: 'Adyar', lat: 13.0067, lon: 80.2578 },
      { name: 'Tambaram', lat: 12.9229, lon: 80.1274 },
    ];

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

    let closestSector = sectors[0];
    let minDistance = getDistance(coords.lat, coords.lon, closestSector.lat, closestSector.lon);

    for (let i = 1; i < sectors.length; i++) {
      const d = getDistance(coords.lat, coords.lon, sectors[i].lat, sectors[i].lon);
      if (d < minDistance) {
        minDistance = d;
        closestSector = sectors[i];
      }
    }

    setSelectedZone(closestSector.name);
    setDetectedMessage(`Simulated position near ${label} (~${minDistance.toFixed(1)} km to closest sector). Sectors arranged and filtered dynamically!`);
  };

  // Fetch initial hyperlocal municipal data
  const fetchLocalData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to synchronize municipal safety channels.');
      }
      const json: LocalData = await response.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connecting to server failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalData();
  }, []);

  // Auto-detect location on load once municipal data is fetched
  useEffect(() => {
    if (!loading && data && !hasAutoDetected) {
      setHasAutoDetected(true);
      handleDetectLocation();
    }
  }, [loading, data, hasAutoDetected]);

  // Handle reporting custom citizen hazards
  const handleSubmitReport = async (report: {
    category: 'Water' | 'Roads' | 'Power' | 'Hazard' | 'Pollution' | 'Other';
    title: string;
    description: string;
    location: string;
    severity: 'Low' | 'Medium' | 'High';
  }) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      if (!response.ok) {
        throw new Error('Server rejected hazard registration.');
      }
      // Re-fetch all data to ensure synchrony
      await fetchLocalData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Handle verifying citizen hazards
  const handleVerifyReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}/verify`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to sign verification packet.');
      }
      // Re-fetch all data to ensure state sync
      await fetchLocalData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle chatting with safety advisor (Gemini API)
  const handleSendMessage = async (text: string): Promise<string> => {
    try {
      // Pack current dialogue stream and request server
      // The server will build context automatically based on updated memory lists!
      const activeHistory = [
        { role: 'user', parts: [{ text }] }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: activeHistory })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Gemini core computation error.');
      }

      const json = await response.json();
      return json.text || 'The advisor was unable to formulate a safety advice strategy.';
    } catch (err: any) {
      console.error('Chat advice error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-6" id="loading-view">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30 animate-pulse mx-auto shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-display font-semibold text-slate-100">Synchronizing Local Safety Channels...</h1>
          <p className="text-xs text-slate-400 font-mono">Fetching active municipal notices & atmospheric parameters</p>
          <div className="w-32 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full animate-progress" style={{ width: '40%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-6" id="error-view">
        <div className="bg-[#0f172a] border border-red-500/20 p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-12 h-12 bg-red-950/40 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-display font-semibold text-slate-100 mb-2">Relay Connection Denied</h1>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Could not communicate with the municipal RAG database or Gemini coordinator. Please verify your backend server status and credentials.
          </p>
          <button 
            id="retry-connection-btn"
            onClick={() => { setLoading(true); fetchLocalData(); }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-amber-500/10"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const activeNoticesCount = data.notices.filter(n => n.status !== 'Resolved').length;
  const activeReportsCount = data.citizenReports.filter(cr => cr.status !== 'Resolved').length;
  const worstAQI = Math.max(...data.aqi.map(a => a.value));
  const worstAQIZone = data.aqi.find(a => a.value === worstAQI)?.zone || 'N/A';

  return (
    <div className="min-h-screen bg-[#070b13] pb-12 text-slate-100 selection:bg-amber-500 selection:text-slate-950" id="app-container">
      {/* Upper Navigation Bar */}
      <header className="bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800/60 py-4 px-6 sticky top-0 z-10 shadow-lg" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-600/30">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-display font-bold text-slate-100 leading-none tracking-tight">Hyperlocal Health & Safety Advisor</h1>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">RAG AI</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Thiruvallur & Chennai Municipalities • Hyperlocal Citizen Bulletin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="flex items-center gap-2 bg-[#1e293b]/60 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-300" id="live-clock">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{time || 'Loading...'}</span>
            </div>

            {/* Quick Refresh */}
            <button
              id="refresh-btn"
              onClick={fetchLocalData}
              className="p-1.5 hover:bg-[#1e293b] rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer border border-transparent hover:border-slate-800"
              title="Refresh Data"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 3v5h-5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        
        {/* Core Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-banner-grid">
          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Municipal Alerts</span>
              <p className="text-lg font-display font-bold text-slate-200 leading-none mt-1">{activeNoticesCount} Active</p>
            </div>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Worst Sector AQI</span>
              <p className="text-lg font-display font-bold text-slate-200 leading-none mt-1">{worstAQI} ({worstAQIZone})</p>
            </div>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Crowd Hazards</span>
              <p className="text-lg font-display font-bold text-slate-200 leading-none mt-1">{activeReportsCount} Reported</p>
            </div>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">RAG Safety Level</span>
              <p className="text-lg font-display font-bold text-slate-200 leading-none mt-1">Grounded</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800" id="tabs-navigation">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-amber-500 text-amber-400 font-semibold bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Municipal Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'border-amber-500 text-amber-400 font-semibold bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Dedicated Safety AI Chat</span>
            <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
              Live
            </span>
          </button>
        </div>

        {/* Tab content rendering */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn" id="dashboard-tab-content">
            {/* Hyperlocal Zone Selection Map / Matrix */}
            <ZoneSelector 
              weather={data.weather}
              aqi={data.aqi}
              selectedZone={selectedZone}
              onSelectZone={(zone) => {
                setSelectedZone(zone);
                setLiveTracking(false);
              }}
              onDetectLocation={handleDetectLocation}
              detectingLocation={detectingLocation}
              detectedMessage={detectedMessage}
              liveTracking={liveTracking}
              onToggleLiveTracking={handleDetectLocation}
              userCoords={userCoords}
              currentSimulationName={currentSimulationName}
              onSimulateLocation={handleSimulateLocation}
            />

            {/* Primary Bento Layout - Dashboard view: alerts take full width */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="bento-split-container">
              {/* Alerts Panel takes up full width for a premium, spacious monitoring dashboard experience */}
              <div className="lg:col-span-12" id="left-column">
                <AlertsPanel 
                  notices={data.notices}
                  citizenReports={data.citizenReports}
                  waterSchedules={data.waterSchedules}
                  weather={data.weather}
                  aqi={data.aqi}
                  selectedZone={selectedZone}
                  onVerifyReport={handleVerifyReport}
                  onSubmitReport={handleSubmitReport}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="chat-tab-container">
            {/* Advisory Context Sidebar */}
            <div className="lg:col-span-4 space-y-6" id="chat-sidebar">
              {/* Context Status Card */}
              <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-sm" id="chat-context-card">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Active Advisory Context
                </h3>
                
                <div className="space-y-4">
                  {/* Current Selected Sector */}
                  <div className="bg-[#1e293b]/40 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Selected Sector</p>
                      <h4 className="text-sm font-semibold text-slate-200 mt-0.5">{selectedZone}</h4>
                    </div>
                    <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">
                      {selectedZone === 'All' ? 'Full Coverage' : 'Localized RAG'}
                    </span>
                  </div>

                  {/* Weather & AQI Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1e293b]/40 border border-slate-800 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Atmosphere</p>
                      {(() => {
                        const w = data.weather.find(x => x.zone === selectedZone) || data.weather[0];
                        return (
                          <div className="mt-1">
                            <span className="text-xs font-semibold text-slate-200 block truncate">{w?.condition || 'Clear'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{w?.temp || 28}°C</span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-[#1e293b]/40 border border-slate-800 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">Air Quality</p>
                      {(() => {
                        const a = data.aqi.find(x => x.zone === selectedZone) || data.aqi[0];
                        return (
                          <div className="mt-1">
                            <span className="text-xs font-semibold text-slate-200 block truncate">{a?.status || 'Good'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">AQI: {a?.value || 35}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Active Alerts Count */}
                  <div className="bg-red-500/5 border border-red-500/20 p-3.5 rounded-lg flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">Hyperlocal Safeguards</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                        The advisor synthesizes {data.notices.filter(n => selectedZone === 'All' || n.zone === selectedZone).length} active municipal notices and {data.citizenReports.filter(r => selectedZone === 'All' || r.zone === selectedZone).length} crowd-sourced hazards inside the active zone boundaries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Quick-Tuner inside Sidebar */}
              <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-sm" id="chat-simulation-tuner">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Dynamic GPS Sim Board
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Test the RAG context separation by simulating your GPS location across Tamil Nadu sectors. The AI advisor dynamically updates its safety response context.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={handleDetectLocation}
                    className={`w-full text-left text-xs font-semibold p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      liveTracking
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-[#1e293b]/40 text-slate-300 border-slate-800 hover:bg-[#1e293b]/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${liveTracking ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`}></span>
                      <span>📡 Live GPS Tracking</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-85">{liveTracking ? 'ACTIVE' : 'OFF'}</span>
                  </button>

                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono uppercase font-semibold">Or Pick Sector</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Thiruvallur Center', lat: 13.1438, lon: 79.9079, label: 'Thiruvallur' },
                      { name: 'Ambattur Industrial', lat: 13.1143, lon: 80.1548, label: 'Ambattur' },
                      { name: 'Anna Nagar Tower', lat: 13.0850, lon: 80.2101, label: 'Anna Nagar' },
                      { name: 'Adyar Beach Coast', lat: 13.0067, lon: 80.2578, label: 'Adyar' },
                      { name: 'Tambaram Railway Hub', lat: 12.9229, lon: 80.1274, label: 'Tambaram' },
                    ].map((preset) => {
                      const isSimulated = currentSimulationName === preset.name;
                      return (
                        <button
                          key={preset.name}
                          onClick={() => handleSimulateLocation({ lat: preset.lat, lon: preset.lon }, preset.name)}
                          className={`text-[11px] font-medium p-2 rounded-lg border transition-all truncate text-left cursor-pointer ${
                            isSimulated
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 font-semibold shadow-inner'
                              : 'bg-[#1e293b]/40 text-slate-300 border-slate-800 hover:bg-[#1e293b]/70'
                          }`}
                          title={`Simulate GPS coords in ${preset.label}`}
                        >
                          📍 {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Full-Size Chat Panel */}
            <div className="lg:col-span-8" id="chat-main-panel">
              <ChatPanel 
                onSendMessage={handleSendMessage}
                selectedZone={selectedZone}
              />
            </div>
          </div>
        )}

        {/* Safety Disclaimer footer card */}
        <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex items-start gap-3" id="safety-disclaimer-card">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-200">Hyperlocal Safety Advisory Protocol</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This advisor utilizes Retrieval-Augmented Generation (RAG) to synthesize live weather reports, Air Quality Indexes, water utility calendars, and user-submitted incident logs. While citizen-confirmed reports help map hazards rapidly, always exercise caution and consult official emergency broadcast systems during extreme weather or critical environmental emergencies.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
