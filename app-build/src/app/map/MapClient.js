'use client';
import { useEffect, useRef } from 'react';

export default function MapClient({ floodZones, safeZones, stations, riskData, selectedLayer }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (mapInstance.current) return;

        // Load leaflet dynamically
        const loadLeaflet = async () => {
            const L = (await import('leaflet')).default;
            await import('leaflet/dist/leaflet.css');

            const map = L.map(mapRef.current, {
                center: [-1.2921, 36.8219],
                zoom: 12,
                zoomControl: true,
            });

            // Dark tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                maxZoom: 19,
            }).addTo(map);

            const getRiskColor = (risk) => {
                const colors = { CRITICAL: '#ef4444', HIGH: '#f97316', MODERATE: '#f59e0b', LOW: '#22c55e' };
                return colors[risk] || '#3b82f6';
            };

            // Add flood zones
            if (floodZones?.features) {
                floodZones.features.forEach(feature => {
                    const coords = feature.geometry.coordinates[0].map(c => [c[1], c[0]]);
                    const color = getRiskColor(feature.properties.risk);
                    L.polygon(coords, {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.3,
                        weight: 2,
                    }).addTo(map).bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:4px">
              <strong style="font-size:14px">${feature.properties.name}</strong><br/>
              <span style="color:${color};font-weight:600">Risk: ${feature.properties.risk}</span><br/>
              <span>Depth: ${feature.properties.depth}m</span>
            </div>
          `);
                });
            }

            // Add safe zones
            if (safeZones) {
                safeZones.forEach(zone => {
                    const icon = L.divIcon({
                        html: `<div style="background:#22c55e;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(34,197,94,0.4)">🏕️</div>`,
                        className: '',
                        iconSize: [28, 28],
                    });
                    L.marker([zone.lat, zone.lng], { icon }).addTo(map).bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:4px">
              <strong style="font-size:14px">${zone.name}</strong><br/>
              <span style="color:#22c55e;font-weight:600">Safe Zone</span><br/>
              <span>Capacity: ${zone.capacity.toLocaleString()} people</span>
            </div>
          `);
                });
            }

            // Add weather stations
            if (stations) {
                stations.forEach(station => {
                    const icon = L.divIcon({
                        html: `<div style="background:#3b82f6;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(59,130,246,0.4)">📡</div>`,
                        className: '',
                        iconSize: [24, 24],
                    });
                    L.marker([station.lat, station.lng], { icon }).addTo(map).bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:4px">
              <strong style="font-size:14px">${station.name}</strong><br/>
              <span style="color:var(--text-secondary)">ID: ${station.id}</span><br/>
              <span class="badge badge-info" style="font-size:11px">${station.type}</span>
            </div>
          `);
                });
            }

            // Add risk zone markers from API data
            if (riskData?.zones) {
                riskData.zones.forEach(zone => {
                    const color = getRiskColor(zone.riskLevel);
                    const icon = L.divIcon({
                        html: `<div style="background:${color};color:white;border-radius:8px;padding:2px 8px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px ${color}44">${zone.name}: ${zone.riskScore}</div>`,
                        className: '',
                    });
                    L.marker([zone.lat, zone.lng], { icon }).addTo(map);
                });
            }

            mapInstance.current = map;
        };

        loadLeaflet();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [floodZones, safeZones, stations, riskData]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
