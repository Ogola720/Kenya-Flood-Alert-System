// Historical Weather API - fetches real past weather data from Open-Meteo Archive
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '12');

    try {
        // Calculate date range for the past N months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const params = new URLSearchParams({
            latitude: -1.2921,
            longitude: 36.8219,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            daily: 'precipitation_sum,precipitation_hours,rain_sum,weather_code',
            timezone: 'Africa/Nairobi',
        });

        const res = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`,
            { next: { revalidate: 86400 } } // Cache for 24h
        );

        if (!res.ok) {
            // Fallback to forecast API with past_days
            const fallbackParams = new URLSearchParams({
                latitude: -1.2921,
                longitude: 36.8219,
                daily: 'precipitation_sum,precipitation_hours,rain_sum,weather_code',
                past_days: Math.min(months * 30, 92), // Max 92 days for forecast API
                timezone: 'Africa/Nairobi',
            });

            const fallbackRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?${fallbackParams.toString()}`,
                { next: { revalidate: 3600 } }
            );

            if (!fallbackRes.ok) {
                throw new Error('Both archive and forecast APIs failed');
            }

            const fallbackData = await fallbackRes.json();
            return NextResponse.json(formatDailyData(fallbackData));
        }

        const data = await res.json();
        return NextResponse.json(formatDailyData(data));
    } catch (error) {
        console.error('Historical weather error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch historical data', message: error.message },
            { status: 500 }
        );
    }
}

function formatDailyData(data) {
    if (!data?.daily) {
        return { days: [], monthlyAggregates: [], totalRainfall: 0, rainyDays: 0 };
    }

    const daily = data.daily;
    const days = [];
    const monthMap = {};

    for (let i = 0; i < (daily.time?.length || 0); i++) {
        const date = daily.time[i];
        const precip = daily.precipitation_sum?.[i] || 0;
        const precipHours = daily.precipitation_hours?.[i] || 0;
        const rain = daily.rain_sum?.[i] || 0;
        const weatherCode = daily.weather_code?.[i] || 0;

        days.push({ date, precip, precipHours, rain, weatherCode });

        // Aggregate by month
        const monthKey = date.substring(0, 7); // YYYY-MM
        if (!monthMap[monthKey]) {
            monthMap[monthKey] = { month: monthKey, totalPrecip: 0, rainyDays: 0, heavyDays: 0, maxDaily: 0 };
        }
        monthMap[monthKey].totalPrecip += precip;
        if (precip > 1) monthMap[monthKey].rainyDays++;
        if (precip > 20) monthMap[monthKey].heavyDays++;
        monthMap[monthKey].maxDaily = Math.max(monthMap[monthKey].maxDaily, precip);
    }

    const monthlyAggregates = Object.values(monthMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(m => ({
            ...m,
            totalPrecip: Math.round(m.totalPrecip * 10) / 10,
            maxDaily: Math.round(m.maxDaily * 10) / 10,
            monthLabel: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        }));

    const totalRainfall = Math.round(days.reduce((s, d) => s + d.precip, 0) * 10) / 10;
    const rainyDays = days.filter(d => d.precip > 1).length;
    const heavyRainDays = days.filter(d => d.precip > 20).length;

    return {
        days,
        monthlyAggregates,
        totalRainfall,
        rainyDays,
        heavyRainDays,
        period: {
            start: daily.time?.[0],
            end: daily.time?.[daily.time.length - 1],
            totalDays: days.length,
        },
        timestamp: new Date().toISOString(),
    };
}
