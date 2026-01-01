import { useEffect, useState } from 'react';
import { BinService } from '../../api/bin.service';
import type { Bin } from '../../api/bin.service';
import StatCard from '../../components/dashboard/StatCard';
import { useSocket } from '../../hooks/useSocket';

const AdminDashboard = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [criticalBins, setCriticalBins] = useState<number>(0);
  const [normalBins, setNormalBins] = useState<number>(0);
  const [emptyBins, setEmptyBins] = useState<number>(0);
  const [avgFillLevel, setAvgFillLevel] = useState<number>(0);
  const socket = useSocket();

  // Calculate metrics from bins
  const calculateMetrics = (binsData: Bin[]) => {
    const critical = binsData.filter((b) => b.status === 'CRITICAL').length;
    const normal = binsData.filter((b) => b.status === 'NORMAL').length;
    const empty = binsData.filter((b) => b.status === 'EMPTY').length;
    const avgFill = binsData.length > 0
      ? Math.round(binsData.reduce((sum, b) => sum + b.currentFill, 0) / binsData.length)
      : 0;

    setCriticalBins(critical);
    setNormalBins(normal);
    setEmptyBins(empty);
    setAvgFillLevel(avgFill);
  };

  // Initial load
  useEffect(() => {
    const loadBins = async () => {
      try {
        const data = await BinService.getAllBins();
        setBins(data);
        calculateMetrics(data);
      } catch (error) {
        console.error('Failed to load bins:', error);
      }
    };
    loadBins();
  }, []);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.on('binUpdated', (updatedBin: Bin) => {
      console.log('📡 Dashboard: Real-time bin update:', updatedBin.binId);
      
      setBins((prevBins) => {
        const newBins = prevBins.map((b) =>
          b.binId === updatedBin.binId ? updatedBin : b
        );
        
        // Recalculate metrics with updated bins
        calculateMetrics(newBins);
        
        return newBins;
      });
    });

    return () => {
      socket.off('binUpdated');
    };
  }, [socket]);

  const totalBins = bins.length;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
        Real-time updates: {socket ? '✅ Connected' : '❌ Disconnected'}
      </p>

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
        <StatCard title="Empty Bins" value={emptyBins} color="#64748b" />
        <StatCard title="Avg Fill Level" value={`${avgFillLevel}%`} color="#f59e0b" />
      </div>
    </div>
  );
};

export default AdminDashboard;
