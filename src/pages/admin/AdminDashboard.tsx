import { useEffect, useState } from 'react';
import { BinService } from '../../api/bin.service';
import type { Bin } from '../../api/bin.service';
import StatCard from '../../components/dashboard/StatCard';

const AdminDashboard = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    BinService.getAllBins()
      .then(setBins)
      .catch(() => setError('Failed to load bins'));
  }, []);

  const totalBins = bins.length;
  const fullBins = bins.filter(b => b.status === 'FULL').length;
  const halfBins = bins.filter(b => b.status === 'HALF').length;
  const emptyBins = bins.filter(b => b.status === 'EMPTY').length;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        <StatCard title="Total Bins" value={totalBins} color="#2563eb" />
        <StatCard title="Full Bins" value={fullBins} color="#dc2626" />
        <StatCard title="Half-filled Bins" value={halfBins} color="#f59e0b" />
        <StatCard title="Empty Bins" value={emptyBins} color="#16a34a" />
      </div>
    </div>
  );
};

export default AdminDashboard;
