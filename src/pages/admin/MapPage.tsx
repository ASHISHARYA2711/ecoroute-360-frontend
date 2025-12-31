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

const MapPage = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapCenter: LatLngExpression = [20.5937, 78.9629];

  useEffect(() => {
    BinService.getAllBins()
      .then(setBins)
      .catch(() => setError('Failed to load bins'));

    RouteService.getRouteHistory()
      .then(setRoutes)
      .catch(() => {});
  }, []);

  const routePath: LatLngExpression[] | null =
    activeRoute?.bins.map(b => [b.latitude, b.longitude]) ?? null;

  return (
    <div style={{ height: '80vh' }}>
      <h1>Map View</h1>

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
                Route {r._id.slice(-5)} ({r.bins.length} bins)
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

        {/* Bin Markers */}
        {bins.map(bin => (
          <Marker
            key={bin._id}
            position={[
              bin.location.latitude,
              bin.location.longitude,
            ]}
          >
            <Popup>
              <strong>Bin ID:</strong> {bin._id} <br />
              <strong>Status:</strong> {bin.status} <br />
              <strong>Fill:</strong> {bin.fillLevel}%
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
