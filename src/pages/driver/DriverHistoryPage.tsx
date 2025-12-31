import { useEffect, useState } from 'react';
import { RouteService } from '../../api/route.service';
import type { Route } from '../../api/route.service';

const DriverHistoryPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    RouteService.getRouteHistory()
      .then(setRoutes)
      .catch(() => setError('Failed to load route history'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading history...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Route History</h1>
      <p style={{ color: '#64748b' }}>
        Previously completed collection routes
      </p>

      <div style={{ marginTop: 20 }}>
        {routes.length === 0 ? (
          <p>No route history available</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={th}>Route ID</th>
                <th style={th}>Stops</th>
                <th style={th}>Distance (km)</th>
                <th style={th}>Completed At</th>
              </tr>
            </thead>

            <tbody>
              {routes.map((route) => (
                <tr key={route._id}>
                  <td style={td}>{route._id}</td>
                  <td style={td}>{route.bins.length}</td>
                  <td style={td}>{route.distance}</td>
                  <td style={td}>
                    {new Date(route.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const th = {
  padding: '12px',
  textAlign: 'left' as const,
  fontSize: 14,
  color: '#334155',
};

const td = {
  padding: '12px',
  borderTop: '1px solid #e5e7eb',
  fontSize: 14,
};

export default DriverHistoryPage;
