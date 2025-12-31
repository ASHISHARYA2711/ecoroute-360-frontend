import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';

import { RouteService } from '../../api/route.service';
import type { Route } from '../../api/route.service';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DriverMapPage = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    RouteService.getRouteHistory()
      .then((routes) => {
        if (routes.length > 0) {
          setRoute(routes[0]); // latest route
        } else {
          setError('No route assigned');
        }
      })
      .catch(() => setError('Failed to load route'));
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!route) return <p>Loading route...</p>;

  const center: LatLngExpression = [
    route.bins[0].latitude,
    route.bins[0].longitude,
  ];

  const path: LatLngExpression[] = route.bins.map((b) => [
    b.latitude,
    b.longitude,
  ]);

  return (
    <div style={{ height: '80vh' }}>
      <h1>Navigation Map</h1>

      <MapContainer center={center} zoom={13} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Route Path */}
        <Polyline
          positions={path}
          pathOptions={{ color: '#2563eb', weight: 5 }}
        />

        {/* Stops */}
        {route.bins.map((bin, index) => (
          <Marker
            key={index}
            position={[bin.latitude, bin.longitude]}
          >
            <Popup>
              <strong>Stop {index + 1}</strong>
              <br />
              Latitude: {bin.latitude}
              <br />
              Longitude: {bin.longitude}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DriverMapPage;
