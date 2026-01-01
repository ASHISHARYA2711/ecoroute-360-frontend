import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../api/auth.service';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'driver' | 'admin';
    truckId: string;
    phone: string;
  }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'driver',
    truckId: '',
    phone: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Call signup API
      await AuthService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        truckId: formData.role === 'driver' ? formData.truckId : undefined,
        phone: formData.phone || undefined,
      });

      // Auto-login after successful signup
      await login(formData.email, formData.password);
      
      // Navigate based on role
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 40,
          borderRadius: 12,
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h2 style={{ marginBottom: 10, color: '#2d3748' }}>♻️ Create Account</h2>
        <p style={{ marginBottom: 30, color: '#718096' }}>
          Join EcoRoute 360 - Smart Waste Management
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
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              style={inputStyle}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Truck ID (only for drivers) */}
          {formData.role === 'driver' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Truck ID (Optional)</label>
              <input
                type="text"
                name="truckId"
                value={formData.truckId}
                onChange={handleChange}
                placeholder="TRUCK-001"
                style={inputStyle}
              />
            </div>
          )}

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {/* Submit Button */}
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 14,
            color: '#4a5568',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 500,
  color: '#4a5568',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: 14,
  boxSizing: 'border-box' as const,
};

export default SignupPage;
