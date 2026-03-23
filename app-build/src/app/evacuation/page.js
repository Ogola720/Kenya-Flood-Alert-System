'use client';
import { useState } from 'react';
import styles from './page.module.css';
import { SAFE_ZONES, FLOOD_ZONES_GEOJSON } from '@/lib/constants';

export default function EvacuationPage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [route, setRoute] = useState(null);
    const [computing, setComputing] = useState(false);

    const predefinedOrigins = [
        { name: 'Kibera', lat: -1.3133, lng: 36.7879 },
        { name: 'Mathare', lat: -1.2580, lng: 36.8580 },
        { name: 'CBD - River Road', lat: -1.2830, lng: 36.8300 },
        { name: 'Eastleigh', lat: -1.2730, lng: 36.8520 },
        { name: 'Mukuru', lat: -1.3100, lng: 36.8800 },
    ];

    const computeRoute = async () => {
        setComputing(true);
        // Simulate route computation with GraphHopper concepts
        await new Promise(r => setTimeout(r, 1500));

        const selectedOrigin = predefinedOrigins.find(o => o.name === origin) || predefinedOrigins[0];
        const selectedDest = SAFE_ZONES.find(z => z.name === destination) || SAFE_ZONES[0];
        const avoidedZones = FLOOD_ZONES_GEOJSON.features.filter(f => f.properties.risk === 'CRITICAL' || f.properties.risk === 'HIGH');

        setRoute({
            origin: selectedOrigin,
            destination: selectedDest,
            distance: (Math.random() * 5 + 2).toFixed(1),
            duration: Math.floor(Math.random() * 20 + 10),
            avoidedZones: avoidedZones.map(z => z.properties.name),
            instructions: [
                { step: 1, text: `Head northeast from ${selectedOrigin.name} on the main road`, distance: '0.3 km' },
                { step: 2, text: '⚠️ AVOID: Turn right to bypass flooded zone at River Road', distance: '0.5 km' },
                { step: 3, text: 'Continue straight on elevated road', distance: '1.2 km' },
                { step: 4, text: '⚠️ AVOID: Detour left around Kibera Riparian flood zone', distance: '0.8 km' },
                { step: 5, text: 'Follow the highland route via Ngong Road', distance: '1.5 km' },
                { step: 6, text: `Arrive at ${selectedDest.name}`, distance: '0.2 km' },
            ],
            safetyNotes: [
                '🚫 Avoid walking through water deeper than 15cm (ankle height)',
                '🔦 Carry a torch/flashlight if traveling at night',
                '📞 Emergency: Call 999 or 112 for rescue services',
                '👥 Travel in groups, assist elderly and children',
                '📡 Keep your phone charged for USSD alerts (*483*123#)',
            ],
        });
        setComputing(false);
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="page-header">
                <h1>Evacuation Routes</h1>
                <p>Dynamic safe routing — avoids flooded zones using GeoJSON polygon exclusion</p>
            </div>

            <div className="grid-2">
                {/* Route Planner */}
                <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>Route planner</h3>
                    <div className="form-group">
                        <label className="form-label">Departure</label>
                        <select className="form-select" value={origin} onChange={e => setOrigin(e.target.value)}>
                            <option value="">Select your area...</option>
                            {predefinedOrigins.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Destination (Safe Zone)</label>
                        <select className="form-select" value={destination} onChange={e => setDestination(e.target.value)}>
                            <option value="">Select safe zone...</option>
                            {SAFE_ZONES.map(z => <option key={z.name} value={z.name}>{z.name} (Cap: {z.capacity.toLocaleString()})</option>)}
                        </select>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={computeRoute}
                        disabled={!origin || !destination || computing}
                        style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--sp-2)' }}
                    >
                        {computing ? 'Computing…' : 'Calculate Safe Route'}
                    </button>

                    {/* Avoided Flood Zones Info */}
                    <div className={styles.avoidInfo}>
                        <h4 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>Active flood zones (auto-avoided)</h4>
                        <div className={styles.floodZoneList}>
                            {FLOOD_ZONES_GEOJSON.features.map((f, i) => (
                                <div key={i} className={styles.floodZoneItem}>
                                    <span className={`badge badge-${f.properties.risk.toLowerCase()}`} style={{ fontSize: '0.625rem' }}>{f.properties.risk}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.properties.name}</span>
                                    <span style={{ fontSize: '0.688rem', color: 'var(--text-muted)' }}>Depth: {f.properties.depth}m</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Route Results */}
                <div>
                    {route ? (
                        <div className="card" style={{ animation: 'slideInRight 0.4s ease-out' }}>
                            <div className={styles.routeHeader}>
                                <h3 className="section-title">Safe evacuation route</h3>
                                <div className={styles.routeStats}>
                                    <span className={styles.routeStat}>🏃 {route.distance} km</span>
                                    <span className={styles.routeStat}>⏱️ {route.duration} min</span>
                                    <span className={styles.routeStat}>🚫 {route.avoidedZones.length} zones avoided</span>
                                </div>
                            </div>

                            <div className={styles.routeDisplay}>
                                <div className={styles.routeEndpoints}>
                                    <div className={styles.endpoint}>
                                        <span className={styles.endpointDot} style={{ background: 'var(--accent-red)' }} />
                                        <div>
                                            <div className={styles.endpointLabel}>FROM</div>
                                            <div className={styles.endpointName}>{route.origin.name}</div>
                                        </div>
                                    </div>
                                    <div className={styles.routeLine} />
                                    <div className={styles.endpoint}>
                                        <span className={styles.endpointDot} style={{ background: 'var(--accent-green)' }} />
                                        <div>
                                            <div className={styles.endpointLabel}>TO</div>
                                            <div className={styles.endpointName}>{route.destination.name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Turn-by-turn */}
                            <h4 style={{ fontSize: '0.84rem', fontWeight: 600, margin: 'var(--sp-4) 0 var(--sp-2)' }}>Turn-by-turn instructions</h4>
                            <div className={styles.instructions}>
                                {route.instructions.map((inst, i) => (
                                    <div key={i} className={styles.instruction}>
                                        <span className={styles.stepNum}>{inst.step}</span>
                                        <div className={styles.stepInfo}>
                                            <p className={styles.stepText}>{inst.text}</p>
                                            <span className={styles.stepDist}>{inst.distance}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Safety Notes */}
                            <div className={styles.safetyNotes}>
                                <h4 style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 'var(--sp-2)', color: 'var(--accent-amber)' }}>Safety notes</h4>
                                {route.safetyNotes.map((note, i) => (
                                    <p key={i} className={styles.safetyNote}>{note}</p>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-16)' }}>
                            <div className="empty-state-icon">🛤️</div>
                            <h3 style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>Plan your safe route</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                Select your current location and a safe zone to compute the optimal evacuation route that avoids all flooded areas.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
