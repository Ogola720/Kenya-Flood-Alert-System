'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Dashboard() {
  const [weather, setWeather] = useState(null);
  const [floodRisk, setFloodRisk] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [weatherRes, riskRes, alertsRes, reportsRes] = await Promise.allSettled([
          fetch('/api/weather?city=Nairobi'),
          fetch('/api/flood-risk'),
          fetch('/api/alerts'),
          fetch('/api/reports'),
        ]);

        if (weatherRes.status === 'fulfilled' && weatherRes.value.ok)
          setWeather(await weatherRes.value.json());
        if (riskRes.status === 'fulfilled' && riskRes.value.ok)
          setFloodRisk(await riskRes.value.json());
        if (alertsRes.status === 'fulfilled' && alertsRes.value.ok)
          setAlerts(await alertsRes.value.json());
        if (reportsRes.status === 'fulfilled' && reportsRes.value.ok)
          setReports(await reportsRes.value.json());
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level) => {
    const colors = { LOW: 'var(--accent-green)', MODERATE: 'var(--accent-amber)', HIGH: 'var(--accent-orange)', CRITICAL: 'var(--accent-red)' };
    return colors[level] || 'var(--brand)';
  };

  const getRiskBg = (level) => {
    const bgs = { LOW: 'var(--accent-green-muted)', MODERATE: 'var(--accent-amber-muted)', HIGH: 'var(--accent-orange-muted)', CRITICAL: 'var(--accent-red-muted)' };
    return bgs[level] || 'var(--brand-subtle)';
  };

  const currentTemp = weather?.current?.temperature_2m;
  const currentPrecip = weather?.current?.precipitation;
  const currentHumidity = weather?.current?.relative_humidity_2m;
  const currentWind = weather?.current?.wind_speed_10m;

  const getWeatherDesc = (code) => {
    if (!code && code !== 0) return 'Loading';
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Cloudy';
    if (code <= 48) return 'Fog';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Heavy Rain';
    return 'Storm';
  };

  const getSeverityBadge = (severity) => {
    const map = { EMERGENCY: 'badge-critical', WARNING: 'badge-high', WATCH: 'badge-moderate', INFO: 'badge-info' };
    return map[severity] || 'badge-info';
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };

  const getHourlyPrecip = () => {
    if (!weather?.hourly) return [];
    const now = new Date();
    return weather.hourly
      .filter(h => {
        const t = new Date(h.time);
        return t >= new Date(now - 12 * 3600000) && t <= new Date(now.getTime() + 12 * 3600000);
      })
      .slice(0, 24)
      .map(h => ({
        time: new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
        value: h.precipitation || 0,
      }));
  };

  const hourlyPrecip = getHourlyPrecip();
  const maxPrecip = Math.max(...hourlyPrecip.map(h => h.value), 1);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time flood monitoring across Kenyan cities</p>
      </div>

      {/* Emergency Banner */}
      {alerts?.alerts?.some(a => a.severity === 'EMERGENCY' && a.status === 'ACTIVE') && (
        <div className={`alert-banner critical ${styles.alertBannerAnimate}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--accent-red-light)', fontSize: '0.84rem' }}>Active Emergency</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              {alerts.alerts.find(a => a.severity === 'EMERGENCY' && a.status === 'ACTIVE')?.title}
            </p>
          </div>
          <Link href="/alerts" className="btn btn-danger btn-sm">View</Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className={`stats-grid animate-stagger ${styles.statsAnimate}`}>
        {/* Flood Risk */}
        <div className="stat-card" style={{ '--accent-color': getRiskColor(floodRisk?.overallRiskLevel) }}>
          <div className="stat-icon" style={{ background: getRiskBg(floodRisk?.overallRiskLevel), color: getRiskColor(floodRisk?.overallRiskLevel) }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Flood Risk</div>
            <div className="stat-value" style={{ color: getRiskColor(floodRisk?.overallRiskLevel) }}>
              {loading ? '—' : floodRisk?.overallRiskLevel || 'N/A'}
            </div>
            <div className="stat-change">Score: {floodRisk?.overallRiskScore ?? '—'}/100</div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="stat-card" style={{ '--accent-color': 'var(--accent-red)' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-red-muted)', color: 'var(--accent-red)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value">{loading ? '—' : alerts?.active ?? 0}</div>
            <div className="stat-change">{alerts?.total ?? 0} total issued</div>
          </div>
        </div>

        {/* Weather */}
        <div className="stat-card" style={{ '--accent-color': 'var(--accent-blue)' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-blue-muted)', color: 'var(--accent-blue)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Nairobi</div>
            <div className="stat-value">{currentTemp != null ? `${Math.round(currentTemp)}°C` : '—'}</div>
            <div className="stat-change">{getWeatherDesc(weather?.current?.weather_code)} · {currentHumidity ?? '—'}% humidity</div>
          </div>
        </div>

        {/* Community Reports */}
        <div className="stat-card" style={{ '--accent-color': 'var(--accent-teal)' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-teal-muted)', color: 'var(--accent-teal)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Community</div>
            <div className="stat-value">{loading ? '—' : reports?.total ?? 0}</div>
            <div className="stat-change positive">{reports?.verified ?? 0} verified reports</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div>
          {/* Rainfall Chart */}
          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="section-header">
              <h3 className="section-title">Precipitation · 24h window</h3>
              <span className="badge badge-info">
                <span className="pulse-dot green" style={{ width: 5, height: 5 }}></span>
                Live
              </span>
            </div>
            <div className={styles.chartArea}>
              {hourlyPrecip.length > 0 ? (
                <div className={styles.barChart}>
                  {hourlyPrecip.map((h, i) => (
                    <div key={i} className={styles.barCol}>
                      <div
                        className={styles.bar}
                        style={{
                          height: `${Math.max((h.value / maxPrecip) * 100, 2)}%`,
                          background: h.value > 34.5 ? 'var(--accent-red)' : h.value > 15 ? 'var(--accent-amber)' : h.value > 0 ? 'var(--brand)' : 'var(--bg-elevated)',
                          opacity: h.value > 0 ? 1 : 0.25,
                        }}
                        title={`${h.time}: ${h.value}mm`}
                      />
                      {i % 3 === 0 && <span className={styles.barLabel}>{h.time}</span>}
                    </div>
                  ))}
                  <div className={styles.thresholdLine} style={{ bottom: `${(34.5 / maxPrecip) * 100}%` }}>
                    <span>34.5 mm/hr threshold</span>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 'var(--sp-10)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Fetching rainfall data…</p>
                </div>
              )}
            </div>
          </div>

          {/* Zone Risk Table */}
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">Monitored zones</h3>
              <Link href="/map" className="btn btn-outline btn-sm">View map</Link>
            </div>
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Risk</th>
                    <th>Level</th>
                    <th>CN</th>
                    <th>Imperv.</th>
                  </tr>
                </thead>
                <tbody>
                  {floodRisk?.zones?.map((zone, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{zone.name}</td>
                      <td>
                        <div className={styles.riskBar}>
                          <div className={styles.riskBarFill} style={{
                            width: `${zone.riskScore}%`,
                            background: getRiskColor(zone.riskLevel),
                          }} />
                          <span className="mono">{zone.riskScore}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${zone.riskLevel.toLowerCase()}`}>{zone.riskLevel}</span>
                      </td>
                      <td>{zone.curveNumber}</td>
                      <td>{(zone.imperviousness * 100).toFixed(0)}%</td>
                    </tr>
                  )) || (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--sp-10)' }}>Loading zones…</td></tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Risk Gauge */}
          <div className="card" style={{ marginBottom: 'var(--sp-6)', textAlign: 'center' }}>
            <h3 className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>Overall risk</h3>
            <div className={styles.gaugeContainer}>
              <svg viewBox="0 0 200 120" className={styles.gaugeSvg}>
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#34d399' }} />
                    <stop offset="33%" style={{ stopColor: '#fbbf24' }} />
                    <stop offset="66%" style={{ stopColor: '#fb923c' }} />
                    <stop offset="100%" style={{ stopColor: '#f43f5e' }} />
                  </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" strokeLinecap="round" />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(floodRisk?.overallRiskScore ?? 0) * 2.51} 251.2`}
                  className={styles.gaugeArc}
                />
                <text x="100" y="82" textAnchor="middle" fill="var(--text-primary)" fontSize="26" fontWeight="700" fontFamily="'DM Sans', sans-serif">
                  {floodRisk?.overallRiskScore ?? '—'}
                </text>
                <text x="100" y="105" textAnchor="middle" fill={getRiskColor(floodRisk?.overallRiskLevel)} fontSize="11" fontWeight="600" fontFamily="'DM Sans', sans-serif">
                  {floodRisk?.overallRiskLevel || 'Loading'}
                </text>
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-4)', marginTop: 'var(--sp-1)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }}></span>Low</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }}></span>Mod</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-orange)', display: 'inline-block' }}></span>High</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)', display: 'inline-block' }}></span>Crit</span>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="section-header">
              <h3 className="section-title">Recent alerts</h3>
              <Link href="/alerts" className="btn btn-outline btn-sm">All</Link>
            </div>
            <div className={styles.alertList}>
              {alerts?.alerts?.slice(0, 4).map((alert, i) => (
                <div key={i} className={styles.alertItem}>
                  <div className={styles.alertDot} style={{ background: getRiskColor(alert.severity === 'EMERGENCY' ? 'CRITICAL' : alert.severity === 'WARNING' ? 'HIGH' : alert.severity === 'WATCH' ? 'MODERATE' : 'LOW') }} />
                  <div className={styles.alertContent}>
                    <div className={styles.alertTitle}>{alert.title}</div>
                    <div className={styles.alertMeta}>
                      <span className={`badge ${getSeverityBadge(alert.severity)}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{alert.severity}</span>
                      <span style={{ color: 'var(--text-faint)', fontSize: '0.7rem' }}>{formatTime(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )) || (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>No alerts</p>
                )}
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>Current conditions</h3>
            <div className={styles.weatherStats}>
              {[
                { icon: '🌡', label: 'Temperature', value: currentTemp != null ? `${currentTemp}°C` : '—' },
                { icon: '💧', label: 'Humidity', value: `${currentHumidity ?? '—'}%` },
                { icon: '🌧', label: 'Precipitation', value: `${currentPrecip ?? 0}mm` },
                { icon: '💨', label: 'Wind', value: `${currentWind ?? '—'}km/h` },
              ].map((item, i) => (
                <div key={i} className={styles.weatherStat}>
                  <span className={styles.weatherStatIcon}>{item.icon}</span>
                  <div>
                    <div className={styles.weatherStatValue}>{item.value}</div>
                    <div className={styles.weatherStatLabel}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
