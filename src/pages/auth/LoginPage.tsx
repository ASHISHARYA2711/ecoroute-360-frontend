import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/user';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate(role === 'ADMIN' ? '/admin' : '/driver/route');
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 40,
          borderRadius: 12,
          width: 360,
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}
      >
        <h2>EcoRoute 360</h2>
        <p style={{ marginBottom: 30 }}>Login to continue</p>

        <button
          onClick={() => handleLogin('ADMIN')}
          style={btn('#2563eb')}
        >
          Login as Admin
        </button>

        <button
          onClick={() => handleLogin('DRIVER')}
          style={btn('#16a34a')}
        >
          Login as Driver
        </button>
      </div>
    </div>
  );
};

const btn = (bg: string) => ({
  width: '100%',
  padding: '12px',
  marginBottom: 12,
  borderRadius: 8,
  border: 'none',
  background: bg,
  color: '#fff',
  fontSize: 16,
  cursor: 'pointer',
});

export default LoginPage;
