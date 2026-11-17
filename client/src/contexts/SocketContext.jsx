import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket = null;

    if (isAuthenticated && user?._id) {
      newSocket = io(window.location.origin, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('join', user._id);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.emit('leave');
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user?._id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

