import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Droplet, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ThumbsUp, 
  MapPin, 
  X, 
  Flame, 
  ChevronRight, 
  Send,
  AlertCircle
} from 'lucide-react';
import { MunicipalNotice, CitizenReport, WaterSchedule, WeatherAdvisory, AQIReport } from '../types';

interface AlertsPanelProps {
  notices: MunicipalNotice[];
  citizenReports: CitizenReport[];
  waterSchedules: WaterSchedule[];
  weather: WeatherAdvisory[];
  aqi: AQIReport[];
  selectedZone: string;
  onVerifyReport: (id: string) => Promise<void>;
  onSubmitReport: (report: {
    category: 'Water' | 'Roads' | 'Power' | 'Hazard' | 'Pollution' | 'Other';
    title: string;
    description: string;
    location: string;
    severity: 'Low' | 'Medium' | 'High';
  }) => Promise<void>;
}

export default function AlertsPanel({
  notices,
  citizenReports,
  waterSchedules,
  weather,
  aqi,
  selectedZone,
  onVerifyReport,
  onSubmitReport
}: AlertsPanelProps) {
  const [activeTab, setActiveTab] = useState<'official' | 'citizen' | 'water'>('official');
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [category, setCategory] = useState<'Water' | 'Roads' | 'Power' | 'Hazard' | 'Pollution' | 'Other'>('Hazard');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering based on selectedZone
  // For notices, if a notice affects the selectedZone or is general, we show it
  const filteredNotices = notices.filter(n => {
    // Some basic keyword matching to link official announcements to selected zones
    const textToSearch = (n.title + ' ' + n.details).toLowerCase();
    if (selectedZone.toLowerCase() === 'all') return true;
    return textToSearch.includes(selectedZone.toLowerCase()) || textToSearch.includes('general') || n.category.toLowerCase() === 'health';
  });

  // Filter schedules
  const filteredSchedules = waterSchedules.filter(ws => {
    if (selectedZone.toLowerCase() === 'all') return true;
    return ws.zone.toLowerCase().includes(selectedZone.toLowerCase());
  });

  // Filter citizen reports
  const filteredCitizenReports = citizenReports.filter(cr => {
    if (selectedZone.toLowerCase() === 'all') return true;
    // Map citizen report locations to our zones roughly
    const loc = cr.location.toLowerCase();
    const desc = cr.description.toLowerCase();
    const tit = cr.title.toLowerCase();
    const zoneLower = selectedZone.toLowerCase();
    return loc.includes(zoneLower) || desc.includes(zoneLower) || tit.includes(zoneLower);
  });

  // Active weather advisory
  const activeWeather = weather.find(w => w.zone === selectedZone);
  const activeAQI = aqi.find(a => a.zone === selectedZone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitReport({ category, title, description, location, severity });
      setSuccessMsg('Your report has been broadcast successfully to the community and logged into the AI context!');
      setTitle('');
      setDescription('');
      setLocation('');
      setCategory('Hazard');
      setSeverity('Medium');
      setTimeout(() => {
        setSuccessMsg('');
        setShowForm(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'High':
        return 'bg-red-950/45 text-red-400 border-red-500/20';
      case 'Medium':
        return 'bg-amber-950/45 text-amber-400 border-amber-500/20';
      case 'Low':
        return 'bg-blue-950/45 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-teal-950/45 text-teal-400 border-teal-500/20';
      case 'Action Taken':
        return 'bg-indigo-950/45 text-indigo-400 border-indigo-500/20';
      case 'Verifying':
        return 'bg-amber-950/45 text-amber-400 border-amber-500/20 animate-pulse';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col h-[650px] relative overflow-hidden" id="alerts-panel">
      {/* Cyberpunk grid subtle background visual */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20"></div>

      {/* Selector Tabs */}
      <div className="flex border-b border-slate-800 pb-3 mb-4 items-center justify-between" id="alerts-panel-tabs">
        <div className="flex gap-2">
          <button
            id="tab-btn-official"
            onClick={() => setActiveTab('official')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'official' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            Official Notices ({filteredNotices.length})
          </button>
          <button
            id="tab-btn-citizen"
            onClick={() => setActiveTab('citizen')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'citizen' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            Citizen Feed ({filteredCitizenReports.length})
          </button>
          <button
            id="tab-btn-water"
            onClick={() => setActiveTab('water')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'water' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            Water Supply ({filteredSchedules.length})
          </button>
        </div>

        {activeTab === 'citizen' && (
          <button
            id="report-hazard-trigger-btn"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg transition-all shadow-md shadow-amber-500/5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Hazard
          </button>
        )}
      </div>

      {/* Sub-status header for the specific sector */}
      {selectedZone && (
        <div className="bg-[#1e293b]/40 rounded-lg p-3 mb-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-300">Currently viewing: <strong className="text-slate-100 font-display">{selectedZone} Sector</strong></span>
          </div>
          {activeAQI && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">AQI:</span>
              <span className="font-mono font-semibold text-slate-200">{activeAQI.value} ({activeAQI.status})</span>
            </div>
          )}
        </div>
      )}

      {/* Weather Alert banner if any alerts exist in current zone */}
      {activeWeather && activeWeather.alerts.map((alertText, index) => (
        <div key={index} className="mb-4 p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-2 text-xs" id={`weather-advisory-banner-${index}`}>
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-normal font-medium">{alertText}</div>
        </div>
      ))}

      {/* Tab Contents: Scrollable list */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin" id="alerts-scroll-area">
        
        {/* Tab 1: Official Municipal Notices */}
        {activeTab === 'official' && (
          filteredNotices.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No official municipal alerts currently scheduled or active for this sector.
            </div>
          ) : (
            filteredNotices.map((n) => (
              <div key={n.id} className="p-4 border border-slate-800/80 rounded-xl bg-[#1e293b]/30 hover:border-slate-700 transition-all flex flex-col gap-2" id={`notice-${n.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {n.category === 'Water' && <Droplet className="w-4 h-4 text-blue-400" />}
                    {n.category === 'Power' && <Flame className="w-4 h-4 text-amber-500" />}
                    {n.category === 'Infrastructure' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                    {n.category === 'Health' && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                    <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-slate-400 bg-slate-800/60 border border-slate-700/50 px-1.5 py-0.5 rounded">{n.category}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{n.date}</span>
                </div>

                <h3 className="font-display font-semibold text-slate-100 text-sm leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{n.details}</p>

                <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{n.schedule}</span>
                  </div>
                  <span className="font-semibold text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded-full text-[10px] border border-teal-500/20">{n.status}</span>
                </div>
              </div>
            ))
          )
        )}

        {/* Tab 2: Citizen Incidents Feed */}
        {activeTab === 'citizen' && (
          filteredCitizenReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No hazard reports from neighbors recorded here yet. Be the first to report an incident in this sector!
            </div>
          ) : (
            filteredCitizenReports.map((cr) => (
              <div key={cr.id} className="p-4 border border-slate-800/80 rounded-xl bg-[#1e293b]/30 hover:border-slate-700 shadow-md transition-all flex flex-col gap-2" id={`citizen-report-${cr.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-semibold uppercase bg-slate-800/60 text-slate-400 border border-slate-700/50 px-1.5 py-0.5 rounded">
                      {cr.category}
                    </span>
                    <span className={`text-[9px] font-medium border px-1.5 py-0.5 rounded ${getSeverityBadge(cr.severity)}`}>
                      {cr.severity} Priority
                    </span>
                  </div>
                  <span className={`text-[9px] font-medium border px-1.5 py-0.5 rounded ${getStatusBadge(cr.status)}`}>
                    {cr.status}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-slate-100 text-sm">{cr.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{cr.description}</p>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{cr.location}</span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(cr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Crowd-Sourced
                  </span>

                  <button
                    id={`verify-btn-${cr.id}`}
                    onClick={() => onVerifyReport(cr.id)}
                    className="flex items-center gap-1.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Confirm Event ({cr.upvotes})</span>
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* Tab 3: Localized Water Supply Schedules */}
        {activeTab === 'water' && (
          filteredSchedules.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No water supply alerts currently registered for this region.
            </div>
          ) : (
            filteredSchedules.map((ws, i) => (
              <div key={i} className="p-4 border border-slate-800/80 rounded-xl bg-[#1e293b]/30 hover:border-slate-700 transition-all flex flex-col gap-2" id={`water-schedule-${i}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-blue-400" />
                    <span className="font-display font-semibold text-slate-100 text-sm">{ws.zone} Zone</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-blue-950/40 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/20">Utility Schedule</span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-1">
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">Supply Days</span>
                    <span className="text-xs font-semibold text-slate-200">{ws.days}</span>
                  </div>
                  <div className="bg-[#1e293b]/40 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">Active Hours</span>
                    <span className="text-xs font-semibold text-slate-200">{ws.hours}</span>
                  </div>
                </div>

                {ws.notes && (
                  <p className="text-xs text-slate-400 leading-normal bg-slate-800/30 p-2 rounded border border-slate-800/50">
                    <strong>Note:</strong> {ws.notes}
                  </p>
                )}
              </div>
            ))
          )
        )}
      </div>

      {/* Form Overlay Modal for Reporting Hazard */}
      {showForm && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="report-modal">
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 shadow-xl w-full max-w-md animate-scale-up" id="report-modal-content">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-display font-semibold text-slate-100 text-base">Submit Citizen Hazard Report</h3>
              </div>
              <button 
                id="close-modal-btn"
                onClick={() => setShowForm(false)} 
                className="text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center" id="report-success-message">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-950/60 text-teal-400 border border-teal-500/30 rounded-full mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-100 text-sm mb-2">Report Broadcast Successfully!</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" id="report-hazard-form">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 font-mono">Category</label>
                  <select
                    id="report-form-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="Hazard" className="bg-[#0f172a] text-slate-200">⚠️ General Hazard (Fallen tree, debris, structural issue)</option>
                    <option value="Water" className="bg-[#0f172a] text-slate-200">💧 Water / Utility Issue (Leaking mains, low pressure)</option>
                    <option value="Roads" className="bg-[#0f172a] text-slate-200">🚗 Road / Transit Issue (Pothole, broken lights, obstruction)</option>
                    <option value="Power" className="bg-[#0f172a] text-slate-200">⚡ Power Infrastructure (Fallen cable, sparking transformer)</option>
                    <option value="Pollution" className="bg-[#0f172a] text-slate-200">💨 Pollution / Environmental (Strange fumes, chemical spill)</option>
                    <option value="Other" className="bg-[#0f172a] text-slate-200">❓ Other Safety Incident</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 font-mono">Severity</label>
                    <select
                      id="report-form-severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="Low" className="bg-[#0f172a] text-slate-200">🟢 Low Priority</option>
                      <option value="Medium" className="bg-[#0f172a] text-slate-200">🟡 Medium Priority</option>
                      <option value="High" className="bg-[#0f172a] text-slate-200">🔴 High Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 font-mono">Exact Sector / Area</label>
                    <select
                      id="report-form-location-sector"
                      onChange={(e) => setLocation(prev => prev ? `${prev} (${e.target.value})` : e.target.value)}
                      className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="" className="bg-[#0f172a] text-slate-200">Select Sector...</option>
                      <option value="Thiruvallur" className="bg-[#0f172a] text-slate-200">Thiruvallur</option>
                      <option value="Ambattur" className="bg-[#0f172a] text-slate-200">Ambattur</option>
                      <option value="Anna Nagar" className="bg-[#0f172a] text-slate-200">Anna Nagar</option>
                      <option value="Adyar" className="bg-[#0f172a] text-slate-200">Adyar</option>
                      <option value="Tambaram" className="bg-[#0f172a] text-slate-200">Tambaram</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 font-mono">Title</label>
                  <input
                    id="report-form-title"
                    type="text"
                    required
                    placeholder="e.g. Broken streetlight causing pitch-black corner"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 font-mono">Address / Intersection Details</label>
                  <input
                    id="report-form-location-details"
                    type="text"
                    required
                    placeholder="e.g. At corner of Gandhi St & 4th Cross"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 font-mono">Description of Hazard</label>
                  <textarea
                    id="report-form-description"
                    required
                    rows={3}
                    placeholder="Detail the exact issue so city crews or emergency personnel can verify. Note if it represents immediate danger."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    id="report-form-cancel-btn"
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-[#1e293b] hover:bg-[#1e293b]/80 text-slate-300 py-2 rounded-lg text-xs font-semibold transition-all border border-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="report-form-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-800 text-slate-950 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    {isSubmitting ? 'Posting...' : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Broadcast Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
