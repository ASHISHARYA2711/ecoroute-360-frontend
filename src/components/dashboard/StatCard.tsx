interface StatCardProps {
  title: string;
  value: number;
  color: string;
}

const StatCard = ({ title, value, color }: StatCardProps) => {
  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: `6px solid ${color}`,
      }}
    >
      <h4 style={{ marginBottom: '10px', color: '#475569' }}>{title}</h4>
      <h2 style={{ fontSize: '28px' }}>{value}</h2>
    </div>
  );
};

export default StatCard;
