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
  const criticalBins = bins.filter(b => b.status === 'CRITICAL').length;
  const normalBins = bins.filter(b => b.status === 'NORMAL').length;
  const avgFillLevel = bins.length > 0
    ? Math.round(bins.reduce((sum, b) => sum + b.currentFill, 0) / bins.length)
    : 0;

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
        <StatCard title="Critical Bins" value={criticalBins} color="#dc2626" />
        <StatCard title="Normal Bins" value={normalBins} color="#16a34a" />
        <StatCard title="Avg Fill Level" value={`${avgFillLevel}%`} color="#f59e0b" />
      </div>
    </div>
  );
};

export default AdminDashboard;
