// Weather API - Fetches real-time data from Open-Meteo for Kenyan cities
import { NextResponse } from 'next/server';

const CITIES = [
    { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
    { name: 'Kisumu', lat: -0.1022, lng: 34.7617 },
    { name: 'Mombasa', lat: -4.0435, lng: 39.6682 },
    { name: 'Nakuru', lat: -0.3031, lng: 36.0800 },
    { name: 'Eldoret', lat: 0.5143, lng: 35.2698 },
    { name: 'Garissa', lat: -0.4532, lng: 39.6461 },
];

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city') || 'Nairobi';

        const cityData = CITIES.find(c => c.name.toLowerCase() === city.toLowerCase()) || CITIES[0];

        const params = new URLSearchParams({
            latitude: cityData.lat,
            longitude: cityData.lng,
            hourly: 'temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,soil_moisture_0_to_7cm',
            current: 'temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code',
            forecast_days: '3',
            timezone: 'Africa/Nairobi',
        });

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
            { next: { revalidate: 300 } }
        );

        if (!response.ok) {
            throw new Error(`Open-Meteo API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Process hourly data for last 24 hours + next 48 hours
        const now = new Date();
        const hourlyData = [];

        if (data.hourly) {
            const times = data.hourly.time || [];
            for (let i = 0; i < times.length; i++) {
                hourlyData.push({
                    time: times[i],
                    temperature: data.hourly.temperature_2m?.[i] ?? null,
                    humidity: data.hourly.relative_humidity_2m?.[i] ?? null,
                    precipitation: data.hourly.precipitation?.[i] ?? 0,
                    rain: data.hourly.rain?.[i] ?? 0,
                    windSpeed: data.hourly.wind_speed_10m?.[i] ?? null,
                    soilMoisture: data.hourly.soil_moisture_0_to_7cm?.[i] ?? null,
                });
            }
        }

        return NextResponse.json({
            city: cityData.name,
            coordinates: { lat: cityData.lat, lng: cityData.lng },
            current: data.current || null,
            hourly: hourlyData,
            units: data.hourly_units || {},
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Weather API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch weather data', message: error.message },
            { status: 500 }
        );
    }
}
