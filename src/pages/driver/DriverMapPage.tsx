import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
} from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import { RouteService } from '../../api/route.service';
import type { Route } from '../../api/route.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DriverMapPage = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Use active route, not history
    const driverId = localStorage.getItem('driverId');
    if (!driverId) { setError('Driver ID not found'); setLoading(false); return; }

    RouteService.getDriverActiveRoute(driverId)
      .then((activeRoute) => {
        if (activeRoute) {
          setRoute(activeRoute);
        } else {
          setError('No active route assigned');
        }
      })
      .catch(() => setError('Failed to load route'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748b', marginTop: 16 }}>Loading map...</p>
    </div>
  );

  if (error || !route || !route.bins.length) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Navigation Map</h1>
      </div>
      <div style={styles.emptyCard}>
        <div style={{ fontSize: 48 }}>🗺️</div>
        <h3 style={{ color: '#e2e8f0', margin: '16px 0 8px' }}>No Active Route</h3>
        <p style={{ color: '#64748b' }}>{error || 'No route assigned yet.'}</p>
      </div>
    </div>
  );

  const center: LatLngExpression = [route.bins[0].location.lat, route.bins[0].location.lng];
  const path: LatLngExpression[] =
    route.geometry && route.geometry.length > 0
      ? route.geometry.map(([lng, lat]) => [lat, lng])
      : route.bins.map((b) => [b.location.lat, b.location.lng]);

  const totalKm = route.distance?.toFixed(1) || 'N/A';
  const totalMins = route.duration ? Math.round(route.duration / 60) : null;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Navigation Map</h1>
          <p style={styles.subtitle}>Your optimised collection route</p>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statChip}>
            <span style={styles.statLabel}>Stops</span>
            <span style={styles.statValue}>{route.bins.length}</span>
          </div>
          <div style={styles.statChip}>
            <span style={styles.statLabel}>Distance</span>
            <span style={styles.statValue}>{totalKm} km</span>
          </div>
          {totalMins && (
            <div style={styles.statChip}>
              <span style={styles.statLabel}>Est. Time</span>
              <span style={styles.statValue}>{totalMins} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={styles.mapWrap}>
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', borderRadius: 14 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {/* Route path */}
          <Polyline positions={path} pathOptions={{ color: '#38bdf8', weight: 5, opacity: 0.85 }} />

          {/* Stop markers */}
          {route.bins.map((bin, index) => (
            <CircleMarker
              key={bin.binId}
              center={[bin.location.lat, bin.location.lng]}
              radius={index === 0 ? 12 : 9}
              pathOptions={{
                fillColor: index === 0 ? '#38bdf8' : '#f59e0b',
                color: '#fff',
                weight: 2,
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', minWidth: 140 }}>
                  <strong style={{ color: '#1e293b' }}>Stop {index + 1}</strong>
                  <br />
                  <span style={{ color: '#475569', fontSize: 13 }}>Bin: {bin.binId}</span>
                  <br />
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>
                    {bin.location.lat.toFixed(4)}, {bin.location.lng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#38bdf8' }} />
          <span>Start</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: '#f59e0b' }} />
          <span>Collection Point</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ width: 24, height: 3, background: '#38bdf8', borderRadius: 2 }} />
          <span>Route Path</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '0 4px' },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' },
  spinner: { width: 36, height: 36, border: '3px solid #1e293b', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24, textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  subtitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  statsRow: { display: 'flex', gap: 10 },
  statChip: { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: 1 },
  statValue: { color: '#38bdf8', fontSize: 16, fontWeight: 700 },
  mapWrap: { height: '68vh', borderRadius: 14, overflow: 'hidden', border: '1px solid #334155', marginBottom: 16 },
  legend: { display: 'flex', gap: 20, padding: '12px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', color: '#94a3b8', fontSize: 13 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: '50%' },
};

export default DriverMapPage;
