// Flood Risk API - SCS-CN computation engine
import { NextResponse } from 'next/server';
import { computeFloodRiskScore, classifyRisk, getRiskSummary } from '@/lib/floodRisk';

const MONITORED_ZONES = [
    { name: 'Kibera', lat: -1.3133, lng: 36.7879, curveNumber: 92, imperviousness: 0.65, soilMoisture: 0.6 },
    { name: 'Mathare', lat: -1.2580, lng: 36.8580, curveNumber: 90, imperviousness: 0.58, soilMoisture: 0.55 },
    { name: 'Mukuru', lat: -1.3100, lng: 36.8800, curveNumber: 88, imperviousness: 0.52, soilMoisture: 0.50 },
    { name: 'CBD', lat: -1.2864, lng: 36.8172, curveNumber: 95, imperviousness: 0.80, soilMoisture: 0.3 },
    { name: 'Kariobangi', lat: -1.2480, lng: 36.8800, curveNumber: 85, imperviousness: 0.45, soilMoisture: 0.45 },
    { name: 'Eastleigh', lat: -1.2730, lng: 36.8520, curveNumber: 87, imperviousness: 0.50, soilMoisture: 0.48 },
    { name: 'Langata', lat: -1.3600, lng: 36.7400, curveNumber: 78, imperviousness: 0.30, soilMoisture: 0.35 },
    { name: 'Westlands', lat: -1.2650, lng: 36.8050, curveNumber: 82, imperviousness: 0.40, soilMoisture: 0.38 },
];

export async function GET(request) {
    try {
        // Fetch current weather for Nairobi to get real rainfall data
        const weatherParams = new URLSearchParams({
            latitude: -1.2921,
            longitude: 36.8219,
            current: 'precipitation,rain',
            hourly: 'precipitation,soil_moisture_0_to_7cm',
            past_days: 5,
            forecast_days: 1,
            timezone: 'Africa/Nairobi',
        });

        let currentRainfall = 0;
        let antecedent5Day = 0;
        let currentSoilMoisture = 0.5;

        try {
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`,
                { next: { revalidate: 300 } }
            );

            if (weatherRes.ok) {
                const weatherData = await weatherRes.json();
                currentRainfall = weatherData.current?.precipitation || 0;

                // Compute 5-day antecedent rainfall
                if (weatherData.hourly?.precipitation) {
                    const precips = weatherData.hourly.precipitation;
                    antecedent5Day = precips.reduce((sum, p) => sum + (p || 0), 0);
                }

                // Get latest soil moisture
                if (weatherData.hourly?.soil_moisture_0_to_7cm) {
                    const soils = weatherData.hourly.soil_moisture_0_to_7cm.filter(v => v !== null);
                    currentSoilMoisture = soils.length > 0 ? soils[soils.length - 1] : 0.5;
                }
            }
        } catch (e) {
            console.warn('Could not fetch live weather, using defaults:', e.message);
        }

        // Compute risk for each zone
        const zones = MONITORED_ZONES.map(zone => {
            const score = computeFloodRiskScore({
                currentRainfall_mmhr: currentRainfall,
                antecedent5DayRainfall_mm: antecedent5Day,
                curveNumber: zone.curveNumber,
                imperviousness: zone.imperviousness,
                soilMoisture: currentSoilMoisture > 0 ? currentSoilMoisture : zone.soilMoisture,
            });

            const level = classifyRisk(score);
            const summary = getRiskSummary(score, zone.name);

            return {
                ...zone,
                riskScore: score,
                riskLevel: level,
                summary,
                currentRainfall,
                antecedent5Day: Math.round(antecedent5Day * 10) / 10,
                soilMoisture: currentSoilMoisture,
            };
        });

        // Sort by risk score descending
        zones.sort((a, b) => b.riskScore - a.riskScore);

        // Overall city risk = highest zone risk
        const overallRisk = zones[0];

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            overallRiskScore: overallRisk.riskScore,
            overallRiskLevel: overallRisk.riskLevel,
            currentRainfall,
            antecedent5Day: Math.round(antecedent5Day * 10) / 10,
            soilMoisture: currentSoilMoisture,
            zones,
        });
    } catch (error) {
        console.error('Flood risk API error:', error);
        return NextResponse.json(
            { error: 'Failed to compute flood risk', message: error.message },
            { status: 500 }
        );
    }
}
