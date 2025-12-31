import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/layout.css';
import type { UserRole } from '../../types/user';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  role: UserRole;
}

const Layout = ({ role }: LayoutProps) => {
  return (
    <div className="app-container">
      <Sidebar role={role} />
      <div className="main-section">
        <Header role={role} />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
