// Kenya Flood Alert System - Constants & Configuration

export const KENYAN_CITIES = [
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, county: 'Nairobi', curveNumber: 89, hsg: 'C', imperviousness: 0.55 },
  { name: 'Kisumu', lat: -0.1022, lng: 34.7617, county: 'Kisumu', curveNumber: 82, hsg: 'B', imperviousness: 0.35 },
  { name: 'Mombasa', lat: -4.0435, lng: 39.6682, county: 'Mombasa', curveNumber: 85, hsg: 'C', imperviousness: 0.42 },
  { name: 'Nakuru', lat: -0.3031, lng: 36.0800, county: 'Nakuru', curveNumber: 78, hsg: 'B', imperviousness: 0.30 },
  { name: 'Eldoret', lat: 0.5143, lng: 35.2698, county: 'Uasin Gishu', curveNumber: 75, hsg: 'B', imperviousness: 0.25 },
  { name: 'Garissa', lat: -0.4532, lng: 39.6461, county: 'Garissa', curveNumber: 70, hsg: 'A', imperviousness: 0.15 },
  { name: 'Busia', lat: 0.4608, lng: 34.1115, county: 'Busia', curveNumber: 76, hsg: 'B', imperviousness: 0.22 },
  { name: 'Nyeri', lat: -0.4169, lng: 36.9511, county: 'Nyeri', curveNumber: 72, hsg: 'B', imperviousness: 0.20 },
];

// From the architecture document - Section 3.2.1
export const FLOOD_THRESHOLDS = {
  DRY_AMC_I: { label: 'Dry (AMC I)', cnAdjust: 75, rainfallThreshold: 45.0 },
  AVG_AMC_II: { label: 'Average (AMC II)', cnAdjust: 89, rainfallThreshold: 34.5 },
  WET_AMC_III: { label: 'Wet (AMC III)', cnAdjust: 98, rainfallThreshold: 15.0 },
};

// Critical I-D threshold for Nairobi from statistical analysis (GPD model, MLE)
export const NAIROBI_ID_THRESHOLD = 34.5; // mm/hr

// Water depth threshold for road impassability (Section 4.2)
export const IMPASSABLE_DEPTH_M = 0.3; // meters

export const RISK_LEVELS = {
  LOW: { label: 'Low', color: '#22c55e', icon: '✅', range: [0, 25] },
  MODERATE: { label: 'Moderate', color: '#f59e0b', icon: '⚠️', range: [25, 50] },
  HIGH: { label: 'High', color: '#f97316', icon: '🔶', range: [50, 75] },
  CRITICAL: { label: 'Critical', color: '#ef4444', icon: '🚨', range: [75, 100] },
};

export const ALERT_CHANNELS = {
  SMS: { label: 'SMS Broadcast', icon: '📱', description: 'Via Africa\'s Talking API' },
  USSD: { label: 'USSD Session', icon: '📞', description: 'Interactive *483*123#' },
  WHATSAPP: { label: 'WhatsApp', icon: '💬', description: 'Via Turn.io / Business API' },
  TELEGRAM: { label: 'Telegram', icon: '✈️', description: 'Bot broadcast to channels' },
};

export const SEVERITY_LEVELS = {
  INFO: { label: 'Information', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  WATCH: { label: 'Flood Watch', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  WARNING: { label: 'Flood Warning', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  EMERGENCY: { label: 'Emergency', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export const SAFE_ZONES = [
  { name: 'Uhuru Park (Elevated)', lat: -1.2870, lng: 36.8173, capacity: 5000 },
  { name: 'Karura Forest Edge', lat: -1.2370, lng: 36.8310, capacity: 3000 },
  { name: 'Nairobi National Park HQ', lat: -1.3680, lng: 36.8320, capacity: 8000 },
  { name: 'Kenyatta University Grounds', lat: -1.1769, lng: 36.9284, capacity: 10000 },
  { name: 'Kasarani Stadium', lat: -1.2205, lng: 36.8935, capacity: 15000 },
  { name: 'Ngong Hills Base', lat: -1.3810, lng: 36.6560, capacity: 4000 },
];

export const FLOOD_ZONES_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Kibera Riparian Zone', risk: 'CRITICAL', depth: 1.2 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[36.7750, -1.3120], [36.7920, -1.3120], [36.7920, -1.3020], [36.7750, -1.3020], [36.7750, -1.3120]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Mathare Valley', risk: 'HIGH', depth: 0.8 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[36.8550, -1.2580], [36.8700, -1.2580], [36.8700, -1.2480], [36.8550, -1.2480], [36.8550, -1.2580]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Mukuru Kwa Njenga', risk: 'HIGH', depth: 0.6 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[36.8750, -1.3100], [36.8900, -1.3100], [36.8900, -1.3000], [36.8750, -1.3000], [36.8750, -1.3100]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Kariobangi Lowlands', risk: 'MODERATE', depth: 0.4 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[36.8780, -1.2480], [36.8920, -1.2480], [36.8920, -1.2380], [36.8780, -1.2380], [36.8780, -1.2480]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Nairobi River - CBD Stretch', risk: 'MODERATE', depth: 0.5 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[36.8100, -1.2880], [36.8300, -1.2880], [36.8300, -1.2830], [36.8100, -1.2830], [36.8100, -1.2880]]]
      }
    },
  ]
};

export const WEATHER_STATIONS = [
  { id: 'WS001', name: 'JKIA Met Station', lat: -1.3192, lng: 36.9278, type: 'KMD' },
  { id: 'WS002', name: 'Wilson Airport', lat: -1.3214, lng: 36.8145, type: 'KMD' },
  { id: 'WS003', name: 'Dagoretti Corner', lat: -1.3006, lng: 36.7500, type: 'TAHMO' },
  { id: 'WS004', name: 'Kabete Met Station', lat: -1.2511, lng: 36.7440, type: 'KMD' },
  { id: 'WS005', name: 'Langata Barracks', lat: -1.3500, lng: 36.7600, type: 'TAHMO' },
  { id: 'WS006', name: 'Eastleigh', lat: -1.2730, lng: 36.8520, type: 'TAHMO' },
];

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/map', label: 'Flood Map', icon: 'Map' },
  { path: '/alerts', label: 'Alerts', icon: 'Bell' },
  { path: '/weather', label: 'Weather', icon: 'CloudRain' },
  { path: '/community', label: 'Community', icon: 'Users' },
  { path: '/evacuation', label: 'Evacuation', icon: 'Route' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
];
