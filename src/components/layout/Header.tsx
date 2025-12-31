import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/user';

interface HeaderProps {
  role: UserRole;
}

const Header = ({ role }: HeaderProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 60,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <strong>{role}</strong> Panel
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: '8px 14px',
          borderRadius: 6,
          border: 'none',
          background: '#dc2626',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
