import { NavLink } from 'react-router-dom';
import type { UserRole } from '../../types/user';

interface SidebarProps {
  role: UserRole;
}

const Sidebar = ({ role }: SidebarProps) => {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'block',
    color: isActive ? '#ffffff' : '#cbd5e1',
    textDecoration: 'none',
    padding: '10px 0',
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <aside className="sidebar">
      <h2 className="logo">EcoRoute 360</h2>

      <nav className="nav-menu">
        {/* ===== ADMIN MENU ===== */}
        {role === 'ADMIN' && (
          <>
            <NavLink to="/admin" style={linkStyle}>
              Dashboard
            </NavLink>

            <NavLink to="/admin/bins" style={linkStyle}>
              Bins
            </NavLink>

            <NavLink to="/admin/routes" style={linkStyle}>
              Routes
            </NavLink>

            <NavLink to="/admin/map" style={linkStyle}>
              Map
            </NavLink>

            <NavLink to="/admin/analytics" style={linkStyle}>
              Analytics
            </NavLink>

            <NavLink to="/admin/drivers" style={linkStyle}>
              Drivers
            </NavLink>

            <NavLink to="/admin/settings" style={linkStyle}>
              Settings
            </NavLink>
          </>
        )}

        {/* ===== DRIVER MENU ===== */}
        {role === 'DRIVER' && (
          <>
            <NavLink to="/driver/route" style={linkStyle}>
              My Route
            </NavLink>

            <NavLink to="/driver/map" style={linkStyle}>
              Map
            </NavLink>

            <NavLink to="/driver/history" style={linkStyle}>
              History
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
