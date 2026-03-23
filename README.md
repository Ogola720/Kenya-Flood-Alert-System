# 🌊 Kenya Flash Flood Early Warning System (FFEWS)

A **real-time flood monitoring and early warning platform** built for Kenyan urban centres. The system combines live weather data, hydrological modelling (SCS-CN method), and community reporting to deliver actionable flood risk assessments and alerts.

> **Live Data** — Every metric on this dashboard is pulled from real-time weather APIs. No hardcoded or simulated data.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Real-Time Dashboard** | Live flood risk scores, precipitation charts, active alerts, and weather conditions |
| **Interactive Flood Map** | Leaflet-based map with flood zone overlays, safe zones, evacuation routes, and weather stations |
| **Smart Alert System** | Auto-generated alerts based on real weather conditions — EMERGENCY, WARNING, WATCH, INFO levels |
| **Weather Monitoring** | City-by-city weather data with hourly forecasts for 8 Kenyan cities |
| **Community Reports** | Crowdsourced flood reports with verification workflow |
| **Evacuation Routes** | Pre-defined safe zones with capacity info and distance calculations |
| **Historical Analytics** | Real precipitation trends, monthly aggregation, and zone risk rankings |
| **Flood Risk Engine** | SCS Curve Number method with imperviousness weighting and Antecedent Moisture Condition (AMC) adjustments |

---

## 🏗️ Architecture

```
Kenya-Flood-Alert-System/
├── app-build/                  # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js              # Dashboard
│   │   │   ├── alerts/              # Alert management
│   │   │   ├── analytics/           # Historical analytics
│   │   │   ├── community/           # Community reports
│   │   │   ├── evacuation/          # Evacuation routes
│   │   │   ├── map/                 # Interactive flood map
│   │   │   ├── weather/             # Weather monitoring
│   │   │   └── api/
│   │   │       ├── alerts/          # Alert generation API
│   │   │       ├── flood-risk/      # SCS-CN risk computation API
│   │   │       ├── historical/      # Historical weather data API
│   │   │       ├── reports/         # Community reports API
│   │   │       └── weather/         # Weather data API
│   │   ├── components/
│   │   │   └── Sidebar.js           # Navigation sidebar
│   │   └── lib/
│   │       ├── constants.js         # Cities, thresholds, GeoJSON zones
│   │       └── floodRisk.js         # SCS-CN flood risk model
│   └── package.json
├── Kenyan Flood Alert System Development.pdf   # Project documentation
├── LICENSE                     # MIT License
└── README.md
```

---

## 🔬 Flood Risk Model

The flood risk engine implements the **SCS Curve Number (CN) method** from the USDA, adapted for Kenyan urban environments:

1. **Potential Maximum Retention**: `S = (25400 / CN) - 254`
2. **Runoff Depth**: `Q = (P - 0.2S)² / (P + 0.8S)` when `P > 0.2S`
3. **Risk Score** = weighted combination of:
   - Runoff ratio (40%)
   - Rainfall intensity vs threshold (30%)
   - Imperviousness factor (20%)
   - AMC adjustment (10%)

### Monitored Cities

| City | County | Curve Number | Imperviousness |
|---|---|---|---|
| Nairobi | Nairobi | 89 | 55% |
| Mombasa | Mombasa | 85 | 42% |
| Kisumu | Kisumu | 82 | 35% |
| Nakuru | Nakuru | 78 | 30% |
| Eldoret | Uasin Gishu | 75 | 25% |
| Busia | Busia | 76 | 22% |
| Nyeri | Nyeri | 72 | 20% |
| Garissa | Garissa | 70 | 15% |

### Critical Thresholds

- **Nairobi I-D Threshold**: 34.5 mm/hr (from GPD model, MLE)
- **Road Impassability Depth**: 0.3m
- **AMC Classes**: Dry (I), Average (II), Wet (III) — with CN adjustments

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or 20.x
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ogola720/Kenya-Flood-Alert-System.git
cd Kenya-Flood-Alert-System

# Navigate to the app directory
cd app-build

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
cd app-build
npm run build
npm start
```

---

## 🌐 Data Sources

| Source | Usage | Cost |
|---|---|---|
| [Open-Meteo Weather API](https://open-meteo.com/) | Real-time weather, hourly forecasts | **Free** — no API key required |
| [Open-Meteo Archive API](https://open-meteo.com/) | Historical precipitation data | **Free** — no API key required |

> No API keys or environment variables are required. The system uses entirely free, open data sources.

---

## 📱 Pages Overview

### Dashboard (`/`)
Central command view with live flood risk gauge, precipitation chart (24h window), zone risk table, recent alerts, and current weather conditions. Auto-refreshes every 5 minutes.

### Flood Map (`/map`)
Interactive Leaflet map displaying flood-prone zones (GeoJSON overlays), safe zones with capacity info, weather station locations, and evacuation points across Nairobi.

### Alerts (`/alerts`)
Real-time alert feed generated dynamically from weather conditions. Supports EMERGENCY, WARNING, WATCH, and INFO severity levels with filtering and status tracking.

### Weather (`/weather`)
Multi-city weather dashboard showing current conditions and hourly forecasts for all 8 monitored Kenyan cities.

### Community (`/community`)
Crowdsourced flood reporting system. Residents can submit reports with location data, which are displayed to aid response coordination.

### Evacuation (`/evacuation`)
Pre-defined safe zones with capacity information. Includes distance calculations and routing guidance for emergency evacuations.

### Analytics (`/analytics`)
Historical weather data analysis with monthly aggregation, precipitation trends, rainy day counts, and zone risk rankings over time.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router & API routes |
| **React 19** | UI component library |
| **Leaflet** | Interactive mapping |
| **CSS Modules** | Scoped, modular styling |
| **Open-Meteo** | Weather data provider |

---

## 🚢 Deployment (Vercel)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repository
4. Set **Root Directory** to `app-build`
5. Deploy — Vercel auto-detects Next.js

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root Directory | `app-build` |
| Build Command | `next build` (default) |
| Node.js Version | 18.x or 20.x |
| Environment Variables | None required |

---

## 📊 Alert Flow

```
Open-Meteo API ──► /api/flood-risk ──► Zone Risk Calculation
                                            │
                              ┌──────────────┴──────────────┐
                              ▼              ▼              ▼
                         CRITICAL         HIGH         MODERATE
                        EMERGENCY       WARNING         WATCH
                          Alert          Alert          Alert
```

Alerts are generated automatically when weather conditions exceed thresholds — no manual intervention needed.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👥 Authors

**Ogola720** — [GitHub](https://github.com/Ogola720)

---

<p align="center">
  <strong>Built with ❤️ for flood resilience in Kenya</strong>
</p>
