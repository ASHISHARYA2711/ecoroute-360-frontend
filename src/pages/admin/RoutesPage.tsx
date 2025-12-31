import { useEffect, useState } from 'react';
import { RouteService } from '../../api/route.service';
import type { Route } from '../../api/route.service';

const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await RouteService.getRouteHistory();
      setRoutes(data);
    } catch {
      setError('Failed to load route history');
    }
  };

  const generateRoute = async () => {
    setLoading(true);
    setError(null);
    try {
      await RouteService.generateOptimizedRoute();
      await loadHistory();
    } catch {
      setError('Failed to generate route');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div>
      <h1>Route Optimization</h1>

      <div style={{ margin: '12px 0' }}>
        <button
          onClick={generateRoute}
          disabled={loading}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Generating...' : 'Generate Optimized Route'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        {routes.length === 0 ? (
          <p>No routes generated yet.</p>
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
                <th style={th}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id}>
                  <td style={td}>{r._id}</td>
                  <td style={td}>{r.bins.length}</td>
                  <td style={td}>{r.distance}</td>
                  <td style={td}>
                    {new Date(r.createdAt).toLocaleString()}
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

export default RoutesPage;
