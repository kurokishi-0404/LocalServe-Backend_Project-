import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      const userId = user?.id || user?._id;
      if (userId) {
        newSocket.emit('join_user', userId);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('booking:created', (data) => {
      addToast(
        `New booking received for "${data.service?.title || 'Service'}"!`,
        'success'
      );
    });

    newSocket.on('booking:status', (data) => {
      addToast(
        `Booking status updated to "${data.status?.toUpperCase()}"!`,
        'info'
      );
    });

    newSocket.on('chat:message', (data) => {
      addToast('New chat message received!', 'info');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, user?._id]);

  const joinBookingRoom = (bookingId) => {
    if (socket && bookingId) {
      socket.emit('join_booking', bookingId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        toasts,
        addToast,
        removeToast,
        joinBookingRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
