import { useEffect, useState } from 'react';
import { RouteService } from '../../api/route.service';
import type { Route } from '../../api/route.service';

const DriverRoutePage = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStop, setCurrentStop] = useState(0);

  useEffect(() => {
    // Get driverId from localStorage (set during login)
    const driverId = localStorage.getItem('driverId');
    
    
    if (!driverId) {
      setError('Driver ID not found. Please log in again.');
      return;
    }

    // Fetch driver's active route
    RouteService.getDriverActiveRoute(driverId)
      .then((activeRoute) => {
        if (activeRoute) {
          setRoute(activeRoute);
        } else {
          setError('No active route assigned');
        }
      })
      .catch((err) => {
        console.error('Error loading route:', err);
        setError('Failed to load route');
      });
  }, []);

  const markCollected = () => {
    if (!route) return;
    if (currentStop < (route.bins?.length || 0) - 1) {
      setCurrentStop((prev) => prev + 1);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (!route || !route.bins || route.bins.length === 0) {
    return <p>No route assigned or route has no bins.</p>;
  }

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

        <div style={{ marginTop: 16 }}>
          <p>
            <strong>Bin ID:</strong> {stop.binId}
          </p>
          <p>
            <strong>Location:</strong> {stop.location.lat.toFixed(4)},{' '}
            {stop.location.lng.toFixed(4)}
          </p>
        </div>

        <button
          onClick={markCollected}
          disabled={currentStop === route.bins.length - 1}
          style={{
            marginTop: 16,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background:
              currentStop === route.bins.length - 1 ? '#94a3b8' : '#16a34a',
            color: '#fff',
            cursor:
              currentStop === route.bins.length - 1
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {currentStop === route.bins.length - 1
            ? 'Route Complete!'
            : 'Mark as Collected'}
        </button>
      </div>
    </div>
  );
};

export default DriverRoutePage;
