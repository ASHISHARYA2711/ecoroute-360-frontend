import { useEffect, useState } from 'react';
import { BinService } from '../../api/bin.service';
import type { Bin } from '../../api/bin.service';

const statusColor = (status: Bin['status']) => {
  switch (status) {
    case 'FULL':
      return '#dc2626';
    case 'HALF':
      return '#f59e0b';
    case 'EMPTY':
      return '#16a34a';
    default:
      return '#64748b';
  }
};

const BinsPage = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    BinService.getAllBins()
      .then(setBins)
      .catch(() => setError('Failed to load bins'));
  }, []);

  return (
    <div>
      <h1>Bins</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
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
              <th style={th}>Fill Level (%)</th>
              <th style={th}>Status</th>
              <th style={th}>Last Updated</th>
            </tr>
          </thead>

          <tbody>
            {bins.length === 0 && !error && (
              <tr>
                <td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>
                  No bins available
                </td>
              </tr>
            )}

            {bins.map(bin => (
              <tr key={bin._id}>
                <td style={td}>{bin._id}</td>
                <td style={td}>{bin.location.latitude}</td>
                <td style={td}>{bin.location.longitude}</td>
                <td style={td}>{bin.fillLevel}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      color: '#fff',
                      backgroundColor: statusColor(bin.status),
                      fontSize: 12,
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
