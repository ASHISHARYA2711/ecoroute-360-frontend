import { useEffect, useState } from 'react';
import { DriverService } from '../../api/driver.service';
import type { Driver } from '../../api/driver.service';

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    DriverService.getAllDrivers()
      .then(setDrivers)
      .catch(() => setError('Failed to load drivers'))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: Driver['status']) =>
    status === 'ACTIVE' ? '#16a34a' : '#dc2626';

  if (loading) return <p>Loading drivers...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Drivers</h1>
      <p style={{ color: '#64748b' }}>
        Manage municipal drivers and assign routes
      </p>

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
              <th style={th}>Driver ID</th>
              <th style={th}>Name</th>
              <th style={th}>Phone</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver._id}>
                  <td style={td}>{driver._id}</td>
                  <td style={td}>{driver.name}</td>
                  <td style={td}>{driver.phone}</td>
                  <td style={td}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        color: '#fff',
                        background: statusColor(driver.status),
                        fontSize: 12,
                      }}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#2563eb',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      Assign Route
                    </button>
                  </td>
                </tr>
              ))
            )}
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

export default DriversPage;
