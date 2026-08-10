import { useEffect, useState } from 'react';
import { RouteService } from '../../api/route.service';
import { BinService } from '../../api/bin.service';
import type { Route } from '../../api/route.service';

const DriverRoutePage = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [routeDone, setRouteDone] = useState(false);
  const [collected, setCollected] = useState<boolean[]>([]);

  useEffect(() => {
    const driverId = localStorage.getItem('driverId');
    if (!driverId) { setError('Driver ID not found. Please log in again.'); setLoading(false); return; }

    const fetchActiveRoute = () => {
      RouteService.getDriverActiveRoute(driverId)
        .then((activeRoute) => {
          if (activeRoute) {
            setRoute(activeRoute);
            setCollected(new Array(activeRoute.bins.length).fill(false));
            setCurrentStop(0);
            setRouteDone(false);
            setError(null);
          } else {
            setRoute(null);
          }
        })
        .catch(() => setError('Failed to load route'))
        .finally(() => setLoading(false));
    };

    fetchActiveRoute();
    const poll = setInterval(fetchActiveRoute, 30000);
    return () => clearInterval(poll);
  }, []);

  const markCollected = async () => {
    if (!route || completing) return;
    const currentBin = route.bins[currentStop];
    setCompleting(true);

    try {
      await BinService.resetBin(currentBin.binId);
      const newCollected = [...collected];
      newCollected[currentStop] = true;
      setCollected(newCollected);

      const isLastStop = currentStop === route.bins.length - 1;

      if (isLastStop) {
        // Mark route as completed in backend
        await RouteService.updateRouteStatus(route._id, 'completed');
        setRouteDone(true);
      } else {
        setCurrentStop((prev) => prev + 1);
      }
    } catch {
      setError('Failed to mark bin as collected. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const progressPct = route ? Math.round((currentStop / route.bins.length) * 100) : 0;

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.spinner} />
      <p style={{ color: '#94a3b8', marginTop: 16 }}>Loading your route...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorCard}>
      <span style={{ fontSize: 24 }}>⚠️</span>
      <p style={{ margin: '8px 0 0', color: '#fca5a5' }}>{error}</p>
    </div>
  );

  if (routeDone) return (
    <div style={styles.doneCard}>
      <div style={{ fontSize: 56 }}>🎉</div>
      <h2 style={{ color: '#4ade80', margin: '16px 0 8px' }}>Route Complete!</h2>
      <p style={{ color: '#94a3b8' }}>All {route?.bins.length} bins have been collected.</p>
      <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
        The route has been marked as completed in the system.
      </p>
    </div>
  );

  if (!route || !route.bins.length) return (
    <div style={styles.emptyCard}>
      <div style={{ fontSize: 48 }}>📭</div>
      <h3 style={{ color: '#e2e8f0', margin: '16px 0 8px' }}>No Active Route</h3>
      <p style={{ color: '#64748b' }}>No route has been assigned to you yet.</p>
      <p style={{ color: '#475569', fontSize: 13 }}>Check back later or contact your admin.</p>
    </div>
  );

  const stop = route.bins[currentStop];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Route</h1>
          <p style={styles.subtitle}>Follow the stops below to complete your collection</p>
        </div>
        <div style={styles.routeBadge}>
          <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Route</span>
          <span style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>
            #{route._id.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Progress</span>
          <span style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600 }}>{currentStop}/{route.bins.length} stops</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Stop Cards */}
      <div style={styles.stopsRow}>
        {route.bins.map((bin, idx) => (
          <div
            key={bin.binId}
            style={{
              ...styles.stopDot,
              background: idx < currentStop ? '#22c55e' : idx === currentStop ? '#38bdf8' : '#1e293b',
              border: idx === currentStop ? '2px solid #38bdf8' : '2px solid transparent',
            }}
            title={`Stop ${idx + 1}: ${bin.binId}`}
          >
            {idx < currentStop ? '✓' : idx + 1}
          </div>
        ))}
      </div>

      {/* Current Stop Card */}
      <div style={styles.card}>
        <div style={styles.cardBadge}>
          Stop {currentStop + 1} of {route.bins.length}
        </div>

        <div style={styles.binInfo}>
          <div style={styles.binIcon}>🗑️</div>
          <div>
            <p style={styles.binIdLabel}>Bin ID</p>
            <p style={styles.binIdValue}>{stop.binId}</p>
          </div>
        </div>

        <div style={styles.locationRow}>
          <span style={styles.locationIcon}>📍</span>
          <div>
            <p style={styles.locationLabel}>GPS Coordinates</p>
            <p style={styles.locationValue}>
              {stop.location.lat.toFixed(5)}, {stop.location.lng.toFixed(5)}
            </p>
          </div>
        </div>

        <button
          onClick={markCollected}
          disabled={completing}
          style={{
            ...styles.collectBtn,
            opacity: completing ? 0.7 : 1,
            cursor: completing ? 'wait' : 'pointer',
          }}
        >
          {completing ? (
            <>⏳ Processing...</>
          ) : currentStop === route.bins.length - 1 ? (
            <>✅ Collect & Complete Route</>
          ) : (
            <>✅ Mark as Collected</>
          )}
        </button>
      </div>

      {/* Upcoming stops preview */}
      {currentStop < route.bins.length - 1 && (
        <div style={styles.upcoming}>
          <p style={styles.upcomingTitle}>Upcoming Stops</p>
          {route.bins.slice(currentStop + 1, currentStop + 3).map((bin, idx) => (
            <div key={bin.binId} style={styles.upcomingItem}>
              <span style={styles.upcomingNum}>{currentStop + idx + 2}</span>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>{bin.binId}</span>
              <span style={{ color: '#475569', fontSize: 12, marginLeft: 'auto' }}>
                {bin.location.lat.toFixed(4)}, {bin.location.lng.toFixed(4)}
              </span>
            </div>
          ))}
          {route.bins.length - currentStop - 1 > 2 && (
            <p style={{ color: '#475569', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
              +{route.bins.length - currentStop - 3} more stops
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '0 4px' },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' },
  spinner: { width: 36, height: 36, border: '3px solid #1e293b', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorCard: { background: '#1e1e2e', border: '1px solid #ef4444', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40, color: '#fca5a5' },
  doneCard: { background: 'linear-gradient(135deg, #0f2027, #1a3a2a)', border: '1px solid #22c55e', borderRadius: 16, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40, textAlign: 'center' },
  emptyCard: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40, textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  subtitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  routeBadge: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  progressWrap: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '16px 20px', marginBottom: 20 },
  progressBar: { height: 8, background: '#1e293b', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)', borderRadius: 999, transition: 'width 0.5s ease' },
  stopsRow: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  stopDot: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'default', transition: 'all 0.3s ease' },
  card: { background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid #334155', borderRadius: 16, padding: 28, marginBottom: 20 },
  cardBadge: { display: 'inline-block', background: '#0ea5e920', border: '1px solid #0ea5e940', borderRadius: 999, padding: '4px 14px', fontSize: 12, color: '#38bdf8', fontWeight: 600, marginBottom: 20 },
  binInfo: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: '#0f172a', borderRadius: 10 },
  binIcon: { fontSize: 32 },
  binIdLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: 1, margin: 0 },
  binIdValue: { color: '#f1f5f9', fontSize: 20, fontWeight: 700, margin: '4px 0 0', fontFamily: 'monospace' },
  locationRow: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24, padding: '14px 16px', background: '#0f172a', borderRadius: 10 },
  locationIcon: { fontSize: 20, marginTop: 2 },
  locationLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: 1, margin: 0 },
  locationValue: { color: '#94a3b8', fontSize: 14, margin: '4px 0 0', fontFamily: 'monospace' },
  collectBtn: { width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: 0.5, transition: 'all 0.2s ease' },
  upcoming: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '16px 20px' },
  upcomingTitle: { color: '#64748b', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: 1, margin: '0 0 12px' },
  upcomingItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1e293b' },
  upcomingNum: { width: 24, height: 24, borderRadius: '50%', background: '#1e293b', color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};

export default DriverRoutePage;
