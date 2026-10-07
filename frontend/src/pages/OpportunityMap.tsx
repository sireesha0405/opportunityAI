import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { Opportunity } from '../types';
import { OpportunityModal } from '../components/OpportunityModal';
import { ReportModal } from '../components/ReportModal';

// Center changer helper component for smooth leaflet animation
const RecenterMap: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 11, { duration: 1.2 });
  }, [lat, lon, map]);
  return null;
};

// Create custom SVG markers for Red (<=3d), Yellow (4-14d), Green (>14d)
const createMarkerIcon = (urgency: string, matchScore: number) => {
  const colorMap = {
    red: '#f43f5e',
    yellow: '#f59e0b',
    green: '#10b981',
    expired: '#64748b',
  };
  const color = colorMap[urgency as keyof typeof colorMap] || '#3b82f6';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; items-center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.25; ${
    urgency === 'red' ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : ''
  }"></div>
      <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background: #0f172a; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        <span style="font-size: 10px; font-weight: 800; color: ${color};">${matchScore}%</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-opportunity-marker',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

export const OpportunityMap: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [category, setCategory] = useState<string>('All');
  const [urgency, setUrgency] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(50);

  // Selected Opportunity preview
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);
  const [selectedOppForModal, setSelectedOppForModal] = useState<Opportunity | null>(null);
  const [reportingOpp, setReportingOpp] = useState<Opportunity | null>(null);

  // City center coordinates lookup
  const CITY_COORDINATES: Record<string, [number, number]> = {
    Bengaluru: [12.9716, 77.5946],
    Hyderabad: [17.3850, 78.4867],
    Mumbai: [19.0760, 72.8777],
    'New Delhi': [28.6139, 77.2090],
    Pune: [18.5204, 73.8567],
    Chennai: [12.9915, 80.2337],
  };

  const centerCoords = CITY_COORDINATES[selectedCity] || [12.9716, 77.5946];

  const fetchMapOpportunities = async () => {
    setLoading(true);
    try {
      const opps = await api.getMapOpportunities({
        category: category !== 'All' ? category : undefined,
        city: selectedCity !== 'All' ? selectedCity : undefined,
        max_radius_km: radiusKm,
        lat: centerCoords[0],
        lon: centerCoords[1],
        urgency: urgency !== 'All' ? urgency : undefined,
      });
      setOpportunities(opps);
      if (opps.length > 0 && !activeOpportunity) {
        setActiveOpportunity(opps[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapOpportunities();
  }, [selectedCity, category, urgency, radiusKm]);

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-200">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-500" />
            <span>Interactive Opportunity Map</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover verified tech programs, internships, and hackathons by verified location and commute distance.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-300">≤ 3 days (Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">4–14 days (Yellow)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">&gt; 14 days (Green)</span>
          </div>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl glass-panel text-xs">
        {/* City Selector */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Hub Location</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="Bengaluru">Bengaluru (Electronic City / Whitefield / Koramangala)</option>
            <option value="Hyderabad">Hyderabad (HITEC City / Gachibowli)</option>
            <option value="Mumbai">Mumbai (BKC / Powai)</option>
            <option value="New Delhi">New Delhi & NCR</option>
            <option value="Pune">Pune (Hinjawadi / Viman Nagar)</option>
            <option value="Chennai">Chennai (OMR / IITM Research Park)</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Internship">Internships</option>
            <option value="Hackathon">Hackathons</option>
            <option value="Scholarship">Scholarships</option>
            <option value="Fellowship">Fellowships</option>
            <option value="Workshop">Workshops</option>
            <option value="Research Program">Research Programs</option>
          </select>
        </div>

        {/* Deadline Urgency */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Deadline Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Urgencies</option>
            <option value="red">Urgent (≤ 3 days left)</option>
            <option value="yellow">Approaching (4–14 days)</option>
            <option value="green">Open (&gt; 14 days)</option>
          </select>
        </div>

        {/* Radius Slider */}
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-medium">Geographic Radius</span>
            <span className="font-bold text-blue-400">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="10"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-blue-500 mt-1 cursor-pointer"
          />
        </div>
      </div>

      {/* Main Map & Split Opportunity Card Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Container */}
        <div className="lg:col-span-2 h-[550px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <MapContainer
            center={centerCoords}
            zoom={11}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <RecenterMap lat={centerCoords[0]} lon={centerCoords[1]} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {opportunities.map((opp) => {
              if (opp.latitude == null || opp.longitude == null) return null;
              const icon = createMarkerIcon(opp.deadline_urgency || 'yellow', opp.match_score || 85);
              return (
                <Marker
                  key={opp.id}
                  position={[opp.latitude, opp.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => setActiveOpportunity(opp),
                  }}
                >
                  <Popup>
                    <div className="p-1 max-w-xs text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{opp.match_score}% AI Match</span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-sm leading-snug">{opp.title}</h4>
                      <p className="text-slate-400">{opp.organization} • {opp.work_mode}</p>
                      <p className="text-emerald-400 font-medium">
                        {opp.days_remaining} day(s) left to apply
                      </p>
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
                        <button
                          onClick={() => setSelectedOppForModal(opp)}
                          className="text-blue-400 hover:underline font-semibold"
                        >
                          View Details
                        </button>
                        <a
                          href={opp.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Opens ${opp.organization}'s official webpage`}
                          className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold inline-flex items-center gap-1 hover:bg-blue-500 transition-colors"
                        >
                          Company Page <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 z-[400] px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-200 shadow-lg">
            📍 Showing {opportunities.length} opportunities near {selectedCity}
          </div>
        </div>

        {/* Selected Opportunity Side Details Drawer */}
        <div className="lg:col-span-1 h-[550px] rounded-2xl glass-panel p-5 overflow-y-auto flex flex-col justify-between">
          {activeOpportunity ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {activeOpportunity.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {activeOpportunity.work_mode}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{activeOpportunity.trust_score}% Verified</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {activeOpportunity.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-300">
                    {activeOpportunity.organization}
                  </span>
                  <span>•</span>
                  <span>{activeOpportunity.location}</span>
                </div>
              </div>

              {/* Match and Urgency Indicator */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">AI Compatibility:</span>
                  <span className="font-bold text-blue-400">
                    {activeOpportunity.match_score}% Match
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="font-bold text-amber-400">
                    {activeOpportunity.days_remaining} day(s) left ({new Date(activeOpportunity.deadline).toLocaleDateString()})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Eligibility Status:</span>
                  <span className="font-semibold text-emerald-400">
                    {activeOpportunity.eligibility_status || 'Eligible'}
                  </span>
                </div>
              </div>

              {/* Description Snippet */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1">Overview</p>
                <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed">
                  {activeOpportunity.description}
                </p>
              </div>

              {/* Required Skills */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1.5">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeOpportunity.required_skills?.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stated Reward */}
              {activeOpportunity.stipend_or_reward && (
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                  <span className="text-slate-400 block mb-0.5 font-medium">Stipend / Prize:</span>
                  <span className="font-bold text-emerald-300">
                    {activeOpportunity.stipend_or_reward}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-500">
              Select any marker on the map to inspect opportunity details.
            </div>
          )}

          {activeOpportunity && (
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setSelectedOppForModal(activeOpportunity)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                View Full SOP & Rules
              </button>
              <a
                href={activeOpportunity.official_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Opens ${activeOpportunity.organization}'s official webpage`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Official Company Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OpportunityModal
        opportunity={selectedOppForModal}
        onClose={() => setSelectedOppForModal(null)}
        onReport={(opp) => {
          setSelectedOppForModal(null);
          setReportingOpp(opp);
        }}
      />

      <ReportModal
        opportunity={reportingOpp}
        onClose={() => setReportingOpp(null)}
      />
    </div>
  );
};
