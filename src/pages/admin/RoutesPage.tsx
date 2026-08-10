import { useEffect, useState } from 'react';
import { RouteService } from '../../api/route.service';
import { DriverService } from '../../api/driver.service';
import type { Route } from '../../api/route.service';
import type { Driver } from '../../api/driver.service';

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  PENDING:     { background: '#fef9c320', color: '#fbbf24', border: '1px solid #fbbf2440' },
  IN_PROGRESS: { background: '#dbeafe20', color: '#60a5fa', border: '1px solid #60a5fa40' },
  COMPLETED:   { background: '#dcfce720', color: '#4ade80', border: '1px solid #4ade8040' },
  CANCELLED:   { background: '#fee2e220', color: '#f87171', border: '1px solid #f8717140' },
};

const RoutesPage = () => {
  const [routes, setRoutes]               = useState<Route[]>([]);
  const [drivers, setDrivers]             = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [loading, setLoading]             = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [successMsg, setSuccessMsg]       = useState<string | null>(null);
  const [cancellingId, setCancellingId]   = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await RouteService.getRouteHistory();
      setRoutes(data || []);
    } catch {
      setError('Failed to load route history');
      setRoutes([]);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    DriverService.getAllDrivers()
      .then(setDrivers)
      .catch(() => setError('Failed to load drivers'));
  }, []);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const generateRoute = async () => {
    if (!selectedDriverId) { setError('Please select a driver'); return; }
    setLoading(true);
    setError(null);

    try {
      const driver = await DriverService.getDriverById(selectedDriverId);

      if (!driver.currentLocation?.lat || !driver.currentLocation?.lng) {
        setError(`Driver ${driver.name} has no location set. Update driver location first.`);
        return;
      }

      const result = await RouteService.generateOptimizedRoute(
        driver.currentLocation.lat,
        driver.currentLocation.lng,
        selectedDriverId
      );

      if (result.bins && result.bins.length === 0) {
        setError('All bins are currently empty — no collection needed right now.');
        return;
      }

      flash(`✅ Route generated with ${result.bins?.length || 0} stops for ${driver.name}`);
      setSelectedDriverId('');
      await loadHistory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate route');
    } finally {
      setLoading(false);
    }
  };

  const cancelPending = async (driverId: string, driverLabel: string) => {
    if (!window.confirm(`Cancel all PENDING routes for ${driverLabel}?`)) return;
    setCancellingId(driverId);
    try {
      const count = await RouteService.cancelDriverPendingRoutes(driverId);
      flash(`✅ Cancelled ${count} pending route(s) for ${driverLabel}`);
      await loadHistory();
    } catch {
      setError('Failed to cancel routes');
    } finally {
      setCancellingId(null);
    }
  };

  const pendingByDriver = routes.reduce<Record<string, number>>((acc, r) => {
    if ((r as any).status === 'PENDING') {
      acc[r.driverId] = (acc[r.driverId] || 0) + 1;
    }
    return acc;
  }, {});

  if (initialLoading) return <div style={{ padding: 20, color: '#94a3b8' }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
        Route Optimization
      </h1>
      <p style={{ color: '#64748b', marginBottom: 28 }}>
        Generate and manage waste collection routes for drivers
      </p>

      {/* Generate Route Card */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>🗺️ Generate New Route</h3>
        <p style={s.cardSub}>
          Select a driver to generate an optimised route for all critical bins.
          If no bins are critical, the route will include bins with waste.
        </p>

        {Object.keys(pendingByDriver).length > 0 && (
          <div style={s.warningBox}>
            ⚠️ Some drivers have stale PENDING routes from before. Generating a new route will
            automatically cancel them. Or use the <strong>"Cancel Pending"</strong> button in the table below.
          </div>
        )}

        <label style={s.label}>Select Driver:</label>
        <select
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
          style={s.select}
        >
          <option value="">-- Choose Driver --</option>
          {drivers.map((d) => (
            <option key={d.driverId} value={d.driverId}>
              {d.name} ({d.driverId}){d.currentLocation ? ' ✓ Location Available' : ' ⚠️ No Location'}
            </option>
          ))}
        </select>

        <button
          onClick={generateRoute}
          disabled={loading || !selectedDriverId}
          style={{
            ...s.primaryBtn,
            opacity: loading || !selectedDriverId ? 0.5 : 1,
            cursor: loading || !selectedDriverId ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Generating...' : '⚡ Generate Optimised Route'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={s.errorBox}>
          ❌ {error}
          <button onClick={() => setError(null)} style={s.dismissBtn}>✕</button>
        </div>
      )}
      {successMsg && (
        <div style={s.successBox}>{successMsg}</div>
      )}

      {/* Route History Table */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#f1f5f9', margin: 0 }}>Route History</h3>
          <span style={{ color: '#475569', fontSize: 13 }}>{routes.length} routes total</span>
        </div>

        {routes.length === 0 ? (
          <p style={{ color: '#64748b' }}>No routes generated yet.</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Route ID', 'Driver', 'Status', 'Stops', 'Distance (km)', 'Created At', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => {
                  const status = (r as any).status || 'UNKNOWN';
                  const statusStyle = STATUS_STYLE[status] || {};
                  return (
                    <tr key={r._id} style={s.row}>
                      <td style={s.td}>
                        <span style={s.routeId}>#{r._id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ color: '#e2e8f0' }}>{r.driverId}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, ...statusStyle }}>{status}</span>
                      </td>
                      <td style={s.td}>
                        <span style={s.stopsBadge}>{r.bins?.length || 0}</span>
                      </td>
                      <td style={{ ...s.td, color: '#38bdf8', fontWeight: 600 }}>
                        {r.distance?.toFixed(2) || '—'} km
                      </td>
                      <td style={s.td}>
                        <div style={{ color: '#94a3b8', fontSize: 13 }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ color: '#475569', fontSize: 11 }}>
                          {new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={s.td}>
                        {status === 'PENDING' && (
                          <button
                            onClick={() => cancelPending(r.driverId, r.driverId)}
                            disabled={cancellingId === r.driverId}
                            style={s.cancelBtn}
                            title="Cancel all pending routes for this driver"
                          >
                            {cancellingId === r.driverId ? '...' : '✕ Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 },
  cardTitle: { color: '#f1f5f9', margin: '0 0 8px', fontSize: 17 },
  cardSub: { color: '#64748b', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 },
  warningBox: { background: '#78350f20', border: '1px solid #f59e0b40', borderRadius: 8, padding: '12px 16px', color: '#fcd34d', fontSize: 13, marginBottom: 16, lineHeight: 1.6 },
  label: { display: 'block', marginBottom: 8, fontWeight: 500, color: '#94a3b8', fontSize: 14 },
  select: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid #334155', fontSize: 14, cursor: 'pointer', background: '#1e293b', color: '#e2e8f0', marginBottom: 16, outline: 'none' },
  primaryBtn: { padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: 0.3, transition: 'all 0.2s' },
  errorBox: { background: '#fee2e210', border: '1px solid #ef444440', borderRadius: 8, padding: '12px 16px', color: '#fca5a5', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  successBox: { background: '#dcfce710', border: '1px solid #4ade8040', borderRadius: 8, padding: '12px 16px', color: '#86efac', marginBottom: 16 },
  dismissBtn: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16, padding: '0 4px' },
  tableWrap: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '12px 14px', textAlign: 'left' as const, fontSize: 11, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, borderBottom: '1px solid #1e293b', background: '#0a0f1a' },
  row: { borderBottom: '1px solid #0f172a' },
  td: { padding: '12px 14px', fontSize: 13, borderBottom: '1px solid #1a2436', verticalAlign: 'middle' as const },
  routeId: { fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', background: '#1e293b', padding: '3px 8px', borderRadius: 6 },
  badge: { borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
  stopsBadge: { background: '#0ea5e920', color: '#38bdf8', border: '1px solid #0ea5e940', borderRadius: 999, padding: '2px 10px', fontSize: 13, fontWeight: 600 },
  cancelBtn: { padding: '5px 12px', borderRadius: 6, border: '1px solid #ef444440', background: '#fee2e210', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
};

export default RoutesPage;
