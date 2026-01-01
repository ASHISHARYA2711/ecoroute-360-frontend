import { useEffect, useState } from 'react';
import { BinService } from '../../api/bin.service';
import type { Bin } from '../../api/bin.service';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  CRITICAL: '#dc2626',
  NORMAL: '#16a34a',
  EMPTY: '#5e5e5eff'
};

const AnalyticsPage = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    BinService.getAllBins()
      .then(setBins)
      .catch(() => setError('Failed to load analytics data'));
  }, []);

  const statusData = [
    { name: 'CRITICAL', value: bins.filter(b => b.status === 'CRITICAL').length },
    { name: 'NORMAL', value: bins.filter(b => b.status === 'NORMAL').length },
    { name: 'EMPTY', value: bins.filter(b => b.status === 'EMPTY').length },
  ];

  return (
    <div>
      <h1>Analytics</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        style={{
          height: 300,
          background: '#fff',
          padding: 20,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <h3>Bin Status Distribution</h3>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {statusData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.name === 'CRITICAL'
                      ? COLORS.CRITICAL
                      : entry.name === 'NORMAL'
                      ? COLORS.NORMAL
                      : COLORS.EMPTY
                  }
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
