import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  LogOut,
  BarChart,
  Puzzle,
  UserCheck,
  Tags,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";

const menuItems = [
  { label: "Dashboard", icon: Home, path: "/admin" },
  { label: "Visitor Lists", icon: Users, path: "/admin/visitors" },
  { label: "Visitor Analytics", icon: BarChart, path: "/admin/visitors-stats" },
  {
    label: "Masters",
    icon: Puzzle,
    submenu: [
      { label: "Employee", icon: UserCheck, path: "/admin/master/employee" },
      { label: "Department", icon: Tags, path: "/admin/master/Department" },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div
      className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform duration-200 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
        <button className="md:hidden text-gray-500" onClick={onClose}>
          <XCircle />
        </button>
      </div>

      <nav className="p-4 space-y-4">
        {menuItems.map((item, index) => (
          <div key={index}>
            {/*Main Menu with or without submenu*/}
            {item.submenu ? (
              <>
                <div
                  onClick={() => toggleMenu(item.label)}
                  className="flex items-center justify-between text-gray-700 cursor-pointer hover:bg-gray-100 px-4 py-2 rounded"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <span>
                    {openMenus[item.label] ? <ChevronUp /> : <ChevronDown />}
                  </span>
                </div>
                {openMenus[item.label] && (
                  <div className="pl-6 mt-1 space-y-1">
                    {item.submenu.map((sub, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={sub.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
                          location.pathname === sub.path
                            ? "bg-blue-100 text-blue-700 font-semibold shadow-inner"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <sub.icon className="w-5 h-5" />
                          <span>{sub.label}</span>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 
                                    ${
                                      location.pathname === item.path
                                        ? "bg-blue-100 text-blue-700 font-semibold shadow-inner"
                                        : "hover:bg-gray-100 text-gray-700"
                                    }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>
      <div className="px-4 py-3">
        <button
          onClick={() => {
            logout();
            navigate("/login");
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
