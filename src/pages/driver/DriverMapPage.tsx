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
import type { Route, RouteBin } from '../../api/route.service';
import { useSocket } from '../../hooks/useSocket';
import type { Bin } from '../../api/bin.service';

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
  const socket = useSocket();

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

  // Real-time bin updates for route
  useEffect(() => {
    if (!socket || !route) return;

    socket.on('binUpdated', (updatedBin: Bin) => {
      // Check if bin is in current route
      const binInRoute = route.bins.some((b) => b.binId === updatedBin.binId);
      
      if (binInRoute) {
        console.log('📡 Driver Map: Bin in route updated:', updatedBin.binId, updatedBin.status);
        
        // Update route bins with new status
        setRoute((prevRoute) => {
          if (!prevRoute) return prevRoute;
          
          return {
            ...prevRoute,
            bins: prevRoute.bins.map((b) =>
              b.binId === updatedBin.binId
                ? { ...b, status: updatedBin.status, currentFill: updatedBin.currentFill }
                : b
            ),
          };
        });
      }
    });

    return () => {
      socket.off('binUpdated');
    };
  }, [socket, route]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!route || !route.bins || route.bins.length === 0) {
    return <p>No route assigned or route has no bins.</p>;
  }

  const center: LatLngExpression = [
    route.bins[0].location.lat,
    route.bins[0].location.lng,
  ];

  const path: LatLngExpression[] = route.bins.map((b) => [
    b.location.lat,
    b.location.lng,
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
            position={[bin.location.lat, bin.location.lng]}
          >
            <Popup>
              <strong>Stop {index + 1}</strong>
              <br />
              Latitude: {bin.location.lat}
              <br />
              Longitude: {bin.location.lng}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DriverMapPage;
