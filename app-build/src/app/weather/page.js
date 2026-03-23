'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { KENYAN_CITIES } from '@/lib/constants';

export default function WeatherPage() {
    const [weatherData, setWeatherData] = useState({});
    const [selectedCity, setSelectedCity] = useState('Nairobi');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllWeather();
    }, []);

    const fetchAllWeather = async () => {
        setLoading(true);
        const cities = ['Nairobi', 'Kisumu', 'Mombasa', 'Nakuru', 'Eldoret', 'Garissa'];
        const results = {};

        await Promise.all(cities.map(async (city) => {
            try {
                const res = await fetch(`/api/weather?city=${city}`);
                if (res.ok) results[city] = await res.json();
            } catch (e) { console.error(`Error fetching ${city}:`, e); }
        }));

        setWeatherData(results);
        setLoading(false);
    };

    const getWeatherIcon = (code) => {
        if (!code && code !== 0) return '🌤️';
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code <= 48) return '🌫️';
        if (code <= 57) return '🌦️';
        if (code <= 67) return '🌧️';
        if (code <= 77) return '❄️';
        if (code <= 82) return '⛈️';
        return '⛈️';
    };

    const getWeatherDesc = (code) => {
        if (!code && code !== 0) return 'Unknown';
        if (code === 0) return 'Clear Sky';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 57) return 'Drizzle';
        if (code <= 67) return 'Rain';
        if (code <= 77) return 'Snow';
        if (code <= 82) return 'Heavy Rain';
        return 'Thunderstorm';
    };

    const selectedData = weatherData[selectedCity];
    const hourlyPrecip = selectedData?.hourly?.slice(0, 48) || [];
    const maxPrecip = Math.max(...hourlyPrecip.map(h => h.precipitation || 0), 1);

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="page-header">
                <h1>Weather Monitoring</h1>
                <p>Real-time data from Open-Meteo for major Kenyan cities</p>
            </div>

            {/* City Cards Grid */}
            <div className="weather-grid animate-stagger" style={{ marginBottom: 'var(--sp-8)' }}>
                {Object.entries(weatherData).map(([city, data]) => {
                    const current = data.current;
                    return (
                        <div
                            key={city}
                            className={`card ${styles.cityCard} ${selectedCity === city ? styles.selected : ''}`}
                            onClick={() => setSelectedCity(city)}
                        >
                            <div className={styles.cityHeader}>
                                <div>
                                    <h3 className={styles.cityName}>{city}</h3>
                                    <p className={styles.cityDesc}>{getWeatherDesc(current?.weather_code)}</p>
                                </div>
                                <span className={styles.cityIcon}>{getWeatherIcon(current?.weather_code)}</span>
                            </div>
                            <div className={styles.cityTemp}>
                                {current?.temperature_2m != null ? `${Math.round(current.temperature_2m)}°` : '—'}
                            </div>
                            <div className={styles.cityStats}>
                                <span>💧 {current?.relative_humidity_2m ?? '—'}%</span>
                                <span>🌧️ {current?.precipitation ?? 0}mm</span>
                                <span>💨 {current?.wind_speed_10m ?? '—'}km/h</span>
                            </div>
                        </div>
                    );
                })}
                {loading && Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--r-lg)' }} />
                ))}
            </div>

            {/* Detailed View */}
            {selectedData && (
                <div className="grid-2" style={{ animation: 'slideInUp 0.4s ease-out' }}>
                    {/* Hourly Precipitation */}
                    <div className="card">
                        <div className="section-header">
                            <h3 className="section-title">48-hour precipitation · {selectedCity}</h3>
                            <span className="badge badge-info">Open-Meteo</span>
                        </div>
                        <div className={styles.precipChart}>
                            {hourlyPrecip.map((h, i) => (
                                <div key={i} className={styles.precipBar}>
                                    <div
                                        className={styles.precipFill}
                                        style={{
                                            height: `${Math.max((h.precipitation / maxPrecip) * 100, 1)}%`,
                                            background: h.precipitation > 34.5 ? 'var(--accent-red)' : h.precipitation > 15 ? 'var(--accent-amber)' : h.precipitation > 0 ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                                        }}
                                        title={`${new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit' })}: ${h.precipitation}mm`}
                                    />
                                    {i % 6 === 0 && (
                                        <span className={styles.precipLabel}>{new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit', hour12: true })}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Conditions */}
                    <div className="card">
                        <h3 className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>Conditions · {selectedCity}</h3>
                        <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>🌡️</span>
                                <span className={styles.detailLabel}>Temperature</span>
                                <span className={styles.detailValue}>{selectedData.current?.temperature_2m ?? '—'}°C</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>💧</span>
                                <span className={styles.detailLabel}>Humidity</span>
                                <span className={styles.detailValue}>{selectedData.current?.relative_humidity_2m ?? '—'}%</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>🌧️</span>
                                <span className={styles.detailLabel}>Precipitation</span>
                                <span className={styles.detailValue}>{selectedData.current?.precipitation ?? 0} mm</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>💨</span>
                                <span className={styles.detailLabel}>Wind Speed</span>
                                <span className={styles.detailValue}>{selectedData.current?.wind_speed_10m ?? '—'} km/h</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>🌧️</span>
                                <span className={styles.detailLabel}>Rain</span>
                                <span className={styles.detailValue}>{selectedData.current?.rain ?? 0} mm</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailIcon}>📍</span>
                                <span className={styles.detailLabel}>Coordinates</span>
                                <span className={styles.detailValue}>{selectedData.coordinates?.lat?.toFixed(2)}, {selectedData.coordinates?.lng?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className={styles.dataSource}>
                            <span>Data source: Open-Meteo API • Updated: {new Date(selectedData.timestamp).toLocaleTimeString('en-KE')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
