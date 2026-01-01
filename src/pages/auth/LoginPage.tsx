import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will happen automatically via App.tsx based on role
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 40,
          borderRadius: 12,
          width: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ marginBottom: 10, color: '#2d3748' }}>♻️ EcoRoute 360</h2>
        <p style={{ marginBottom: 30, color: '#718096' }}>
          Smart Waste Management System
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 20,
              background: '#fed7d7',
              color: '#c53030',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 500,
                color: '#4a5568',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@test.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 6,
                fontSize: 14,
                fontWeight: 500,
                color: '#4a5568',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 6,
              border: 'none',
              background: isLoading ? '#a0aec0' : '#667eea',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: '#f7fafc',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, marginBottom: 8 }}>
            Demo Credentials:
          </p>
          <p style={{ margin: 0, color: '#4a5568' }}>
            <strong>Admin:</strong> admin@test.com / pass123
          </p>
          <p style={{ margin: 0, color: '#4a5568' }}>
            <strong>Driver:</strong> driver@test.com / pass123
          </p>
        </div>

        {/* Signup Link */}
        <div
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: 14,
            color: '#4a5568',
          }}
        >
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign up here
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

