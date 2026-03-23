'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { FLOOD_ZONES_GEOJSON, SAFE_ZONES, WEATHER_STATIONS } from '@/lib/constants';

// Dynamic import Leaflet to avoid SSR issues
const MapComponent = dynamic(() => import('./MapClient'), { ssr: false, loading: () => <div className={styles.mapLoading}>Loading map...</div> });

export default function MapPage() {
    const [floodRisk, setFloodRisk] = useState(null);
    const [selectedLayer, setSelectedLayer] = useState('all');

    useEffect(() => {
        fetch('/api/flood-risk')
            .then(r => r.ok ? r.json() : null)
            .then(data => setFloodRisk(data))
            .catch(() => { });
    }, []);

    return (
        <div className={styles.mapPage}>
            <div className="page-header" style={{ marginBottom: 'var(--sp-4)' }}>
                <h1>Flood Risk Map</h1>
                <p>Interactive view of flood zones, weather stations, and safe zones</p>
            </div>

            {/* Layer Controls */}
            <div className={styles.controls}>
                <div className={styles.layerButtons}>
                    {['all', 'flood-zones', 'stations', 'safe-zones'].map(layer => (
                        <button
                            key={layer}
                            className={`btn btn-sm ${selectedLayer === layer ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setSelectedLayer(layer)}
                        >
                            {layer === 'all' ? 'All Layers' : layer === 'flood-zones' ? 'Flood Zones' : layer === 'stations' ? 'Stations' : 'Safe Zones'}
                        </button>
                    ))}
                </div>
                <div className={styles.legend}>
                    <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#ef4444' }}></span>Critical</span>
                    <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#f97316' }}></span>High</span>
                    <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#f59e0b' }}></span>Moderate</span>
                    <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#22c55e' }}></span>Safe Zone</span>
                </div>
            </div>

            {/* Map */}
            <div className="map-container-full">
                <MapComponent
                    floodZones={FLOOD_ZONES_GEOJSON}
                    safeZones={SAFE_ZONES}
                    stations={WEATHER_STATIONS}
                    riskData={floodRisk}
                    selectedLayer={selectedLayer}
                />
            </div>

            {/* Info Panel */}
            {floodRisk && (
                <div className={styles.infoPanel}>
                    <div className={styles.infoPanelGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Zones Monitored</span>
                            <span className={styles.infoValue}>{floodRisk.zones?.length || 0}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Current Rainfall</span>
                            <span className={styles.infoValue}>{floodRisk.currentRainfall}mm/hr</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>5-Day Antecedent</span>
                            <span className={styles.infoValue}>{floodRisk.antecedent5Day}mm</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Soil Moisture</span>
                            <span className={styles.infoValue}>{(floodRisk.soilMoisture * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
