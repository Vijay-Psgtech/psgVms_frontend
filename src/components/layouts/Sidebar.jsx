import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Bell, LogOut, BarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { label: 'Dashboard', icon: Home, path:"/admin" },
    { label: 'Visitor Lists', icon: Users, path:"/admin/visitors" },
    { label: 'Visitor Analytics', icon: BarChart, path:'/admin/visitors-stats'},
]

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    return (
        <div
            className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-200 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
                <button className="md:hidden text-gray-500" onClick={onClose}>✕</button>
            </div>

            <nav className="p-4 space-y-4">
                {menuItems.map(({ label, icon: Icon, path })=>{
                    const active = location.pathname === path;
                    return(
                        <NavLink key={label} to={path} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200
                        ${active
                        ? 'bg-blue-100 text-blue-700 font-semibold shadow-inner'
                        : 'hover:bg-gray-100 text-gray-700'}`}>
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                        </NavLink>
                    )
                })}
            </nav>
            <div className="px-4 py-3">
                <button
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-2 w-full rounded-lg"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
