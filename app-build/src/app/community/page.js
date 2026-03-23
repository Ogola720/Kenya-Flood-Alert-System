'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function CommunityPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newReport, setNewReport] = useState({
        reporter: '', phone: '', location: '', description: '', severity: 'MODERATE', type: 'FLOODING'
    });

    useEffect(() => {
        fetch('/api/reports').then(r => r.ok ? r.json() : null).then(data => {
            if (data) setReports(data.reports || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const submitReport = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/reports', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReport),
            });
            if (res.ok) {
                const data = await res.json();
                setReports(prev => [data.report, ...prev]);
                setShowForm(false);
                setNewReport({ reporter: '', phone: '', location: '', description: '', severity: 'MODERATE', type: 'FLOODING' });
            }
        } catch (e) { console.error(e); }
    };

    const typeIcons = { FLOODING: '🌊', RIVER_OVERFLOW: '🏞', DRAINAGE_BLOCKED: '🚧', WATERLOGGING: '💧', LANDSLIDE: '⛰', OTHER: '📋' };
    const sevColors = { HIGH: 'var(--accent-red)', MODERATE: 'var(--accent-amber)', LOW: 'var(--accent-green)' };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="page-header">
                <h1>👥 Community Reports</h1>
                <p>Participatory mapping and citizen feedback — empowering communities as active sensor nodes in the early warning network</p>
            </div>

            {/* Stats */}
            <div className="stats-grid animate-stagger" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="stat-card" style={{ '--accent-color': 'var(--accent-teal)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(20,184,166,0.12)', color: 'var(--accent-teal)' }}>📊</div>
                    <div className="stat-info">
                        <div className="stat-label">Total Reports</div>
                        <div className="stat-value">{reports.length}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--accent-color': 'var(--accent-green)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--accent-green)' }}>✅</div>
                    <div className="stat-info">
                        <div className="stat-label">Verified</div>
                        <div className="stat-value">{reports.filter(r => r.verified).length}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--accent-color': 'var(--accent-red)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--accent-red)' }}>🔴</div>
                    <div className="stat-info">
                        <div className="stat-label">High Severity</div>
                        <div className="stat-value">{reports.filter(r => r.severity === 'HIGH').length}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--accent-color': 'var(--accent-purple)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--accent-purple)' }}>📍</div>
                    <div className="stat-info">
                        <div className="stat-label">Active Scouts</div>
                        <div className="stat-value">12</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ borderRadius: 'var(--r-md)' }}>
                    {showForm ? 'Cancel' : '+ Submit Report'}
                </button>
            </div>

            {/* Report Form */}
            {showForm && (
                <div className={`card ${styles.formCard}`} style={{ animation: 'slideInUp 0.4s ease-out' }}>
                    <h3 className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>Submit flood report</h3>
                    <form onSubmit={submitReport}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Your Name</label>
                                <input className="form-input" value={newReport.reporter} onChange={e => setNewReport({ ...newReport, reporter: e.target.value })} placeholder="e.g., James Otieno" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-input" value={newReport.phone} onChange={e => setNewReport({ ...newReport, phone: e.target.value })} placeholder="+254..." />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input className="form-input" required value={newReport.location} onChange={e => setNewReport({ ...newReport, location: e.target.value })} placeholder="e.g., Kibera, Near Olympic Estate" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-textarea" required value={newReport.description} onChange={e => setNewReport({ ...newReport, description: e.target.value })} placeholder="Describe the flood situation, water level, blocked drains, etc." />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Severity</label>
                                <select className="form-select" value={newReport.severity} onChange={e => setNewReport({ ...newReport, severity: e.target.value })}>
                                    <option value="LOW">Low</option>
                                    <option value="MODERATE">Moderate</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Report Type</label>
                                <select className="form-select" value={newReport.type} onChange={e => setNewReport({ ...newReport, type: e.target.value })}>
                                    <option value="FLOODING">Flooding</option>
                                    <option value="RIVER_OVERFLOW">River Overflow</option>
                                    <option value="DRAINAGE_BLOCKED">Drainage Blocked</option>
                                    <option value="WATERLOGGING">Waterlogging</option>
                                    <option value="LANDSLIDE">Landslide</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-sm)' }}>Submit Report</button>
                    </form>
                </div>
            )}

            {/* Reports Feed */}
            <div className={styles.reportsFeed}>
                {reports.map((report, i) => (
                    <div key={report.id} className={`report-item ${styles.reportCard}`} style={{ animation: `slideInUp 0.5s ease-out ${i * 60}ms both` }}>
                        <div className={styles.reportIcon}>
                            <span>{typeIcons[report.type] || '📋'}</span>
                        </div>
                        <div className={styles.reportContent}>
                            <div className={styles.reportHeader}>
                                <span className={styles.reportName}>{report.reporter}</span>
                                <div className={styles.reportBadges}>
                                    {report.verified && <span className="badge badge-low" style={{ fontSize: '0.625rem' }}>✅ Verified</span>}
                                    <span className={`badge badge-${report.severity.toLowerCase()}`} style={{ fontSize: '0.625rem' }}>{report.severity}</span>
                                </div>
                            </div>
                            <p className={styles.reportLocation}>📍 {report.location}</p>
                            <p className={styles.reportDesc}>{report.description}</p>
                            <span className={styles.reportTime}>
                                {new Date(report.timestamp).toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
