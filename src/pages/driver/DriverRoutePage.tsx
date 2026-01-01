import { useEffect, useState } from 'react';
import { RouteService } from '../../api/route.service';
import type { Route } from '../../api/route.service';

const DriverRoutePage = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStop, setCurrentStop] = useState(0);

  useEffect(() => {
    RouteService.getRouteHistory()
      .then((routes) => {
        if (routes.length > 0) {
          setRoute(routes[0]); // latest route
        }
      })
      .catch(() => setError('No route assigned'));
  }, []);

  const markCollected = () => {
    if (!route) return;
    if (currentStop < route.bins.length - 1) {
      setCurrentStop((prev) => prev + 1);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (!route) return <p>Loading route...</p>;

  const stop = route.bins[currentStop];

  return (
    <div>
      <h1>My Route</h1>

      <div
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <h3>
          Stop {currentStop + 1} of {route.bins.length}
        </h3>

        <p>
          <strong>Latitude:</strong> {stop.location.lat}
        </p>
        <p>
          <strong>Longitude:</strong> {stop.location.lng}
        </p>

        <button
          onClick={markCollected}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '14px',
            fontSize: 16,
            borderRadius: 8,
            border: 'none',
            background: '#16a34a',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Mark Collected
        </button>
      </div>
    </div>
  );
};

export default DriverRoutePage;
