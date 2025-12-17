import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { TbTool } from 'react-icons/tb';

const Topbar = ({ admin, onMenuToggle }) => {
  return (
    <>
    
        <header className="sticky top-0 z-20 bg-white shadow-md px-4 py-3 flex items-center justify-between">
        {/* Hamburger icon for mobile */}
        <button className="md:hidden text-gray-600" onClick={onMenuToggle}>
            <Menu size={24} />
        </button>

        <div className="text-lg font-semibold text-gray-800">
            Welcome, {admin?.name || 'Admin'}!
        </div>

        {/* Bell icon with count */}
        <NotificationBell hostEmail={admin.email} />
        </header>

        
    </>
  );
};

export default Topbar;
