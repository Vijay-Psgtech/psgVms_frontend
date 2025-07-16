import { useEffect, useState } from 'react';
import socket from '../../utils/socket'
import axiosInstance from '../../utils/axiosInstance';

const AdminNotifications = ({ hostEmail }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetch = async () => {
      const res = await axiosInstance.get(`/api/notifications/unread?hostEmail=${hostEmail}`);
      setNotifications(res.data);
    };
    fetch();

    // Real-time socket listener
    socket.on('new-visitor', (visitor) => {
      const note = {
        _id: Math.random().toString(), // temp ID
        message: `${visitor.name} has registered.`,
        visitorId: visitor._id
      };
      setNotifications(prev => [note, ...prev]);
    });

    return () => socket.off('new-visitor');
  }, [hostEmail]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Notifications</h2>
      {notifications.map((n) => (
        <div key={n._id} className="bg-yellow-100 border p-2 rounded mb-2">
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminNotifications;
