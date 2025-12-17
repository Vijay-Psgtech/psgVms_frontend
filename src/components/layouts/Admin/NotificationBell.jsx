import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import socket from '../../../utils/socket';

dayjs.extend(relativeTime);

const NotificationBell = ({ hostEmail }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [shake, setShake] = useState(false);
  const bellRef = useRef();

  // Fetch notifications
  const fetchNotifications = async () => {
    const res = await axiosInstance.get(`/api/notifications/unread?hostEmail=${hostEmail}`);
    setNotifications(res.data);
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for new visitor event
    socket.on('new-visitor', () => {
      fetchNotifications();
      setShake(true);
      setTimeout(() => setShake(false), 800); // Reset animation
    });

    return () => socket.off('new-visitor');
  }, [hostEmail]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAsRead = async (id) => {
    await axiosInstance.patch(`/api/notifications/${id}/mark-as-read`);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleMarkAll = async () => {
    await axiosInstance.patch(`/api/notifications/mark-all-read`, { hostEmail });
    setNotifications([]);
  };

  return (
    <div className="relative" ref={bellRef}>
      <button onClick={() => setDropdownOpen((prev) => !prev)} className="relative">
        <Bell
          className={`w-8 h-8 text-gray-700 hover:text-blue-600 transition-transform duration-300 ${
            shake ? 'animate-shake' : ''
          }`}
        />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-2 w-80 bg-white border-l-2 border-b-2 border-indigo-400 rounded-xl shadow-lg z-50 max-h-96 overflow-auto transition-all duration-300 ${
          dropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-3 border-b font-semibold flex justify-between items-center">
          <span>Unread Notifications</span>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="p-3 border-b hover:bg-gray-50 transition-all">
              <div className="text-sm text-gray-800">{n.message}</div>
              <div className="text-xs text-gray-500 mt-1">
                {dayjs(n.createdAt).fromNow()}
              </div>
              <button
                onClick={() => handleMarkAsRead(n._id)}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Mark as Read
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
