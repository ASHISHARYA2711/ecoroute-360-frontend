import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';

import { BinService } from '../../api/bin.service';
import { RouteService } from '../../api/route.service';
import type { Bin } from '../../api/bin.service';
import type { Route } from '../../api/route.service';
import { useSocket } from '../../hooks/useSocket';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Depot/Collection Center location
const DEPOT_LOCATION = {
  lat: 12.8230,
  lng: 80.0444,
  name: 'Main Depot'
};

// Custom green icon for depot
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapPage = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  const mapCenter: LatLngExpression = [20.5937, 78.9629];

  // Initial load
  useEffect(() => {
    Promise.all([
      BinService.getAllBins().then(setBins).catch(() => setError('Failed to load bins')),
      RouteService.getRouteHistory().then(setRoutes).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  // Real-time bin updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.on('binUpdated', (updatedBin: Bin) => {
      console.log('📡 Map: Real-time bin update:', updatedBin.binId);
      
      setBins((prevBins) =>
        prevBins.map((b) =>
          b.binId === updatedBin.binId ? updatedBin : b
        )
      );
      // Map markers will re-render automatically with new data
    });

    return () => {
      socket.off('binUpdated');
    };
  }, [socket]);

  const routePath: LatLngExpression[] | null = activeRoute
    ? activeRoute.geometry
      ? activeRoute.geometry.map(([lng, lat]) => [lat, lng])  // Use Mapbox geometry if available
      : activeRoute.bins?.map(b => [b.location.lat, b.location.lng]) || []  // Fallback to bin locations
    : null;

  if (loading) {
    return <div style={{ padding: 20 }}>Loading map...</div>;
  }

  return (
    <div style={{ height: '80vh' }}>
      <h1>Map View</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
        Real-time updates: {socket ? '✅ Connected' : '❌ Disconnected'}
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Route Selector */}
      {routes.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <select
            onChange={(e) => {
              const r = routes.find(rt => rt._id === e.target.value);
              setActiveRoute(r || null);
            }}
            defaultValue=""
          >
            <option value="">Select Route to Visualize</option>
            {routes.map(r => (
              <option key={r._id} value={r._id}>
                Route {r._id.slice(-5)} ({r.bins?.length || 0} bins)
              </option>
            ))}
          </select>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={5}
        style={{ height: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Depot Marker */}
        <Marker 
          position={[DEPOT_LOCATION.lat, DEPOT_LOCATION.lng]}
          icon={depotIcon}
        >
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ fontSize: 16 }}>🏢 {DEPOT_LOCATION.name}</strong>
              <br />
              <span style={{ color: '#16a34a', fontSize: 12 }}>
                Collection Center
              </span>
              <br />
              <span style={{ fontSize: 11, color: '#64748b' }}>
                {DEPOT_LOCATION.lat.toFixed(4)}, {DEPOT_LOCATION.lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Bin Markers */}
        {bins.map(bin => (
          <Marker
            key={bin._id}
            position={[
              bin.location.lat,
              bin.location.lng,
            ]}
          >
            <Popup>
              <div>
                <strong>{bin.binId}</strong>
                <br />
                Status:{' '}
                <span
                  style={{
                    color:
                      bin.status === 'CRITICAL'
                        ? '#dc2626'
                        : bin.status === 'EMPTY'
                        ? '#64748b'
                        : '#16a34a',
                    fontWeight: 'bold',
                  }}
                >
                  {bin.status}
                </span>
                <br />
                Fill: {bin.currentFill}%
                <br />
                {bin.lastWasteType && (
                  <>
                    Waste: {bin.lastWasteType}
                    <br />
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Polyline */}
        {routePath && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: 'blue', weight: 4 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapPage;
