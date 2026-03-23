'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [showCreate, setShowCreate] = useState(false);
    const [newAlert, setNewAlert] = useState({
        title: '', message: '', severity: 'WARNING', location: '', channels: ['SMS', 'TELEGRAM'], affectedPopulation: 0
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('/api/alerts');
            if (res.ok) {
                const data = await res.json();
                setAlerts(data.alerts || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const createAlert = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAlert),
            });
            if (res.ok) {
                const data = await res.json();
                setAlerts(prev => [data.alert, ...prev]);
                setShowCreate(false);
                setNewAlert({ title: '', message: '', severity: 'WARNING', location: '', channels: ['SMS', 'TELEGRAM'], affectedPopulation: 0 });
            }
        } catch (e) { console.error(e); }
    };

    const filteredAlerts = filter === 'ALL' ? alerts : alerts.filter(a => a.status === filter);

    const getSeverityBadge = (sev) => {
        const map = { EMERGENCY: 'badge-critical', WARNING: 'badge-high', WATCH: 'badge-moderate', INFO: 'badge-info' };
        return map[sev] || 'badge-info';
    };

    const channelIcons = { SMS: 'SMS', WHATSAPP: 'WA', TELEGRAM: 'TG', USSD: 'USSD' };

    return (
        <div style={{ animation: 'fadeIn 0.35s var(--ease-out)' }}>
            <div className="page-header">
                <h1>Alert Management</h1>
                <p>Create, manage, and disseminate flood alerts across multiple channels</p>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.filterTabs}>
                    {['ALL', 'ACTIVE', 'RESOLVED'].map(f => (
                        <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                            {f === 'ALL' ? `All (${alerts.length})` : f === 'ACTIVE' ? `Active (${alerts.filter(a => a.status === 'ACTIVE').length})` : `Resolved (${alerts.filter(a => a.status === 'RESOLVED').length})`}
                        </button>
                    ))}
                </div>
                <button className="btn btn-danger" onClick={() => setShowCreate(true)}>+ New Alert</button>
            </div>

            {/* Alert List */}
            <div className={styles.alertGrid}>
                {filteredAlerts.map((alert, i) => (
                    <div key={alert.id} className={`card ${styles.alertCard}`} style={{ animationDelay: `${i * 60}ms`, animation: 'slideInUp 0.45s var(--ease-out) both' }}>
                        <div className={styles.alertHeader}>
                            <span className={`badge ${getSeverityBadge(alert.severity)}`}>{alert.severity}</span>
                            <span className={`badge ${alert.status === 'ACTIVE' ? 'badge-critical' : 'badge-low'}`} style={{ fontSize: '0.625rem' }}>
                                {alert.status === 'ACTIVE' && <span className="pulse-dot red" style={{ width: 6, height: 6, marginRight: 4, display: 'inline-block' }}></span>}
                                {alert.status}
                            </span>
                        </div>
                        <h3 className={styles.alertTitle}>{alert.title}</h3>
                        <p className={styles.alertMsg}>{alert.message}</p>
                        <div className={styles.alertMeta}>
                            <span>{alert.location}</span>
                            <span>{alert.affectedPopulation?.toLocaleString()} affected</span>
                        </div>
                        <div className={styles.alertFooter}>
                            <div className="channel-tags">
                                {alert.channels?.map(ch => (
                                    <span key={ch} className="channel-tag">{channelIcons[ch]} {ch}</span>
                                ))}
                            </div>
                            <span className={styles.alertTime}>
                                {new Date(alert.createdAt).toLocaleString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Alert Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Alert</h2>
                            <button className="btn btn-icon btn-outline" onClick={() => setShowCreate(false)}>✕</button>
                        </div>
                        <form onSubmit={createAlert}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Alert Title</label>
                                    <input className="form-input" required value={newAlert.title} onChange={e => setNewAlert({ ...newAlert, title: e.target.value })} placeholder="e.g., Flash Flood Warning - Kibera" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea className="form-textarea" required value={newAlert.message} onChange={e => setNewAlert({ ...newAlert, message: e.target.value })} placeholder="Detailed alert message with instructions..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Severity</label>
                                        <select className="form-select" value={newAlert.severity} onChange={e => setNewAlert({ ...newAlert, severity: e.target.value })}>
                                            <option value="INFO">Information</option>
                                            <option value="WATCH">Flood Watch</option>
                                            <option value="WARNING">Flood Warning</option>
                                            <option value="EMERGENCY">Emergency</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input className="form-input" required value={newAlert.location} onChange={e => setNewAlert({ ...newAlert, location: e.target.value })} placeholder="e.g., Kibera, Nairobi" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Affected Population</label>
                                    <input className="form-input" type="number" value={newAlert.affectedPopulation} onChange={e => setNewAlert({ ...newAlert, affectedPopulation: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dissemination Channels</label>
                                    <div className={styles.channelCheckboxes}>
                                        {Object.entries(channelIcons).map(([ch, icon]) => (
                                            <label key={ch} className={styles.channelCheck}>
                                                <input type="checkbox" checked={newAlert.channels.includes(ch)} onChange={e => {
                                                    const channels = e.target.checked ? [...newAlert.channels, ch] : newAlert.channels.filter(c => c !== ch);
                                                    setNewAlert({ ...newAlert, channels });
                                                }} />
                                                <span>{icon} {ch}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-danger">Broadcast Alert</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
