import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../services/socket';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, setUser } = useContext(AuthContext);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();
    
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (connected && user?.role === 'admin') {
      socket.emit('join:admin');
    }
  }, [connected, user]);

  // Real-time role update — if this user's role changed, update auth state
  useEffect(() => {
    const handleRoleUpdate = ({ userId, role }) => {
      if (user?._id === userId || user?._id === String(userId)) {
        setUser(prev => ({ ...prev, role }));
      }
    };
    socket.on('user:roleUpdated', handleRoleUpdate);
    return () => socket.off('user:roleUpdated', handleRoleUpdate);
  }, [user, setUser]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

