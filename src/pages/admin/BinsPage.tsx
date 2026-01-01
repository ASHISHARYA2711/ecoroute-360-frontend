import { useEffect, useState } from 'react';
import { BinService } from '../../api/bin.service';
import type { Bin } from '../../api/bin.service';
import { useSocket } from '../../hooks/useSocket';

const BinsPage = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  // Initial load
  useEffect(() => {
    const loadBins = async () => {
      try {
        const data = await BinService.getAllBins();
        setBins(data);
      } catch (err) {
        setError('Failed to load bins');
      } finally {
        setLoading(false);
      }
    };
    loadBins();
  }, []);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    // Listen for bin updates
    socket.on('binUpdated', (updatedBin: Bin) => {
      console.log('📡 Real-time bin update:', updatedBin.binId);
      
      setBins((prevBins) => {
        const index = prevBins.findIndex((b) => b.binId === updatedBin.binId);
        if (index !== -1) {
          // Update existing bin
          const newBins = [...prevBins];
          newBins[index] = updatedBin;
          return newBins;
        } else {
          // Add new bin
          return [...prevBins, updatedBin];
        }
      });
    });

    // Cleanup
    return () => {
      socket.off('binUpdated');
    };
  }, [socket]);

  if (loading) return <div>Loading bins...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Bins Management</h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        Total: {bins.length} bins | Real-time updates: {socket ? '✅ Connected' : '❌ Disconnected'}
      </p>

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
            <th style={th}>Bin ID</th>
            <th style={th}>Latitude</th>
            <th style={th}>Longitude</th>
            <th style={th}>Fill Level</th>
            <th style={th}>Gas Level</th>
            <th style={th}>Waste Type</th>
            <th style={th}>Status</th>
            <th style={th}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((bin) => (
            <tr key={bin.binId}>
              <td style={td}>{bin.binId}</td>
              <td style={td}>{bin.location.lat.toFixed(4)}</td>
              <td style={td}>{bin.location.lng.toFixed(4)}</td>
              <td style={td}>{bin.currentFill}%</td>
              <td style={td}>{bin.gasLevel} PPM</td>
              <td style={td}>
                {bin.lastWasteType ? (
                  <span>
                    {bin.lastWasteType}{' '}
                    {bin.wasteConfidence && (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>
                        ({Math.round(bin.wasteConfidence * 100)}%)
                      </span>
                    )}
                  </span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>Not classified</span>
                )}
              </td>
              <td style={td}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      bin.status === 'CRITICAL'
                        ? '#fee2e2'
                        : bin.status === 'EMPTY'
                        ? '#f1f5f9'
                        : '#dcfce7',
                    color:
                      bin.status === 'CRITICAL'
                        ? '#dc2626'
                        : bin.status === 'EMPTY'
                        ? '#64748b'
                        : '#16a34a',
                  }}
                >
                  {bin.status}
                </span>
              </td>
              <td style={td}>
                {new Date(bin.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default BinsPage;
