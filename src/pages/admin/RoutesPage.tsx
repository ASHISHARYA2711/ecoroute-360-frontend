import { useEffect, useState } from 'react';
import { RouteService } from '../../api/route.service';
import { DriverService } from '../../api/driver.service';
import type { Route } from '../../api/route.service';
import type { Driver } from '../../api/driver.service';

const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default depot (fallback if no driver selected)
  const DEFAULT_DEPOT = {
    lat: 12.8230,
    lng: 80.0444,
  };

  const loadHistory = async () => {
    try {
      const data = await RouteService.getRouteHistory();
      setRoutes(data || []);
    } catch (err) {
      console.error('Failed to load routes:', err);
      setError('Failed to load route history');
      setRoutes([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Load drivers and routes on mount
  useEffect(() => {
    loadHistory();
    
    DriverService.getAllDrivers()
      .then(setDrivers)
      .catch(() => setError('Failed to load drivers'));
  }, []);

  const generateRoute = async () => {
    if (!selectedDriverId) {
      setError('Please select a driver');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch driver details to get location
      const driver = await DriverService.getDriverById(selectedDriverId);

      // Check if driver has location
      if (!driver.currentLocation || 
          !driver.currentLocation.lat || 
          !driver.currentLocation.lng) {
        setError(
          `Driver ${driver.name} has no location set. ` +
          `Please update driver location first.`
        );
        setLoading(false);
        return;
      }

      // Generate route from driver's location
      await RouteService.generateOptimizedRoute(
        driver.currentLocation.lat,
        driver.currentLocation.lng,
        selectedDriverId
      );

      // Reload history to show new route
      await loadHistory();
      
      // Clear selection
      setSelectedDriverId('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate route');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div>
      <h1>Route Optimization</h1>

      {/* Driver Selection Section */}
      <div style={{ 
        background: '#fff', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Generate New Route</h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 500,
            color: '#334155'
          }}>
            Select Driver:
          </label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <option value="">-- Choose Driver --</option>
            {drivers.map((d) => (
              <option key={d.driverId} value={d.driverId}>
                {d.name} ({d.driverId})
                {d.currentLocation 
                  ? ' ✓ Location Available' 
                  : ' ⚠️ No Location'}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={generateRoute}
          disabled={loading || !selectedDriverId}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: selectedDriverId ? '#2563eb' : '#94a3b8',
            color: '#fff',
            cursor: selectedDriverId ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {loading ? 'Generating Route...' : 'Generate Optimized Route'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: 12, 
          borderRadius: 6,
          marginBottom: 20 
        }}>
          {error}
        </div>
      )}

      {/* Route History Table */}
      <div style={{ marginTop: 20 }}>
        <h3>Route History</h3>
        {routes.length === 0 ? (
          <p style={{ color: '#64748b' }}>No routes generated yet.</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={th}>Route ID</th>
                <th style={th}>Driver</th>
                <th style={th}>Stops</th>
                <th style={th}>Distance (km)</th>
                <th style={th}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id}>
                  <td style={td}>{r._id.slice(-8)}</td>
                  <td style={td}>{r.driverId}</td>
                  <td style={td}>{r.bins?.length || 0}</td>
                  <td style={td}>{r.distance?.toFixed(2) || 'N/A'}</td>
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
  fontWeight: 500,
};

const td = {
  padding: '12px',
  borderTop: '1px solid #e5e7eb',
  fontSize: 14,
};

export default RoutesPage;
