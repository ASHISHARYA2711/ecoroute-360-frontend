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

  const totalKm = routes.reduce((sum, r) => sum + (r.distance || 0), 0).toFixed(1);
  const totalStops = routes.reduce((sum, r) => sum + (r.bins?.length || 0), 0);

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748b', marginTop: 16 }}>Loading history...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorCard}>
      <span style={{ fontSize: 24 }}>⚠️</span>
      <p style={{ color: '#fca5a5', margin: '8px 0 0' }}>{error}</p>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Route History</h1>
          <p style={styles.subtitle}>Your completed collection routes</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🛣️</span>
          <span style={styles.statNum}>{routes.length}</span>
          <span style={styles.statLabel}>Routes Completed</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>📍</span>
          <span style={styles.statNum}>{totalStops}</span>
          <span style={styles.statLabel}>Total Stops</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>📏</span>
          <span style={styles.statNum}>{totalKm}</span>
          <span style={styles.statLabel}>Total km</span>
        </div>
      </div>

      {/* Table */}
      {routes.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={{ fontSize: 48 }}>📋</div>
          <h3 style={{ color: '#e2e8f0', margin: '16px 0 8px' }}>No History Yet</h3>
          <p style={{ color: '#64748b' }}>Completed routes will appear here.</p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Route ID</th>
                <th style={styles.th}>Stops</th>
                <th style={styles.th}>Distance</th>
                <th style={styles.th}>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={route._id} style={styles.row}>
                  <td style={styles.td}>
                    <span style={styles.indexBadge}>{index + 1}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.routeId}>#{route._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.stopsBadge}>{route.bins?.length || 0}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {route.distance?.toFixed(2) || '—'} km
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>
                      {new Date(route.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </div>
                    <div style={{ color: '#475569', fontSize: 11 }}>
                      {new Date(route.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '0 4px' },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' },
  spinner: { width: 36, height: 36, border: '3px solid #1e293b', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorCard: { background: '#1e1e2e', border: '1px solid #ef4444', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 },
  emptyCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  subtitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 },
  statCard: { background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid #334155', borderRadius: 12, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  statIcon: { fontSize: 24 },
  statNum: { fontSize: 28, fontWeight: 800, color: '#f1f5f9' },
  statLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, textAlign: 'center' as const },
  tableWrap: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '14px 16px', textAlign: 'left' as const, fontSize: 11, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, background: '#0f172a', borderBottom: '1px solid #1e293b' },
  row: { transition: 'background 0.15s' },
  td: { padding: '14px 16px', borderBottom: '1px solid #0f172a', verticalAlign: 'middle' as const },
  indexBadge: { width: 28, height: 28, borderRadius: '50%', background: '#1e293b', color: '#64748b', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  routeId: { fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', background: '#1e293b', padding: '3px 8px', borderRadius: 6 },
  stopsBadge: { background: '#0ea5e920', color: '#38bdf8', border: '1px solid #0ea5e940', borderRadius: 999, padding: '2px 10px', fontSize: 13, fontWeight: 600 },
};

export default DriverHistoryPage;
