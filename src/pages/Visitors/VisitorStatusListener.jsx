import React, { useEffect } from 'react';
import socket from '../../utils/socket';
import { toast } from 'react-toastify';

const VisitorStatusListener = ({ visitorId }) => {
  useEffect(() => {
    socket.on(`status-update-${visitorId}`, (status) => {
      toast.success(`Your meeting is ${status}`);
    });

    return () => socket.off(`status-update-${visitorId}`);
  }, [visitorId]);

  return null; // Just a listener
};

export default VisitorStatusListener;
