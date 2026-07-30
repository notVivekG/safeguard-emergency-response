import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';
import { audioService } from '../services/audioService';
import { requestNotificationPermission, showSOSNotification } from '../services/notifications';

const SOSContext = createContext();

export const SOSProvider = ({ children }) => {
  const [activeSOS, setActiveSOS] = useState(null);
  const [sosHistory, setSosHistory] = useState([]);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Listen for SOS events globally
  useEffect(() => {
    if (!socket || !user) return;

    const handleSOSAlert = (data) => {
      // Ignore if this SOS was created by the current user
      if (data?.userId && String(data.userId) === String(user._id)) return;
      // Plain users (non-volunteers, non-admins) should not receive responder emergency popups
      if (user.role === 'user') return;

      setActiveSOS(data);
      setSosHistory(prev => [data, ...prev]);
      audioService.startEmergencyAlert();
      showSOSNotification(data);
    };

    const handleSOSAssigned = (data) => {
      // Ignore if this SOS was created by the current user
      if (data?.userId && String(data.userId) === String(user._id)) return;
      // If targeted to a specific volunteer, ignore if it's for someone else (unless admin)
      if (data?.volunteerId && String(data.volunteerId) !== String(user._id) && user.role !== 'admin') return;
      if (user.role === 'user') return;

      setActiveSOS(data);
      audioService.startEmergencyAlert();
      showSOSNotification(data);
    };

    const handleSOSCleared = (data) => {
      setActiveSOS(prev => {
        if (prev && (prev._id === data.sosId || prev._id === data._id)) {
          audioService.stopEmergencyAlert();
          return null;
        }
        return prev;
      });
      setSosHistory(prev => prev.filter(s => s._id !== (data.sosId || data._id)));
    };

    const handleBulkCleared = (data) => {
      if (data.ids) {
        setActiveSOS(prev => {
          if (prev && data.ids.includes(prev._id)) {
            audioService.stopEmergencyAlert();
            return null;
          }
          return prev;
        });
        setSosHistory(prev => prev.filter(s => !data.ids.includes(s._id)));
      }
    };

    socket.on('sos:alert', handleSOSAlert);
    socket.on('sos:assigned', handleSOSAssigned);
    socket.on('sos:cleared', handleSOSCleared);
    socket.on('sos:resolved', handleSOSCleared);
    socket.on('sos:bulk-cleared', handleBulkCleared);

    return () => {
      socket.off('sos:alert', handleSOSAlert);
      socket.off('sos:assigned', handleSOSAssigned);
      socket.off('sos:cleared', handleSOSCleared);
      socket.off('sos:resolved', handleSOSCleared);
      socket.off('sos:bulk-cleared', handleBulkCleared);
    };
  }, [socket, user]);

  const dismissSOS = useCallback((sosId) => {
    audioService.stopEmergencyAlert();
    setActiveSOS(null);
  }, []);

  const acceptMission = useCallback((sosId) => {
    audioService.stopEmergencyAlert();
    if (socket && user) {
      socket.emit('mission:accept', { sosId, userId: user._id });
    }
    setActiveSOS(null);
  }, [socket, user]);

  const stopEmergencySound = useCallback(() => {
    audioService.stopEmergencyAlert();
  }, []);

  return (
    <SOSContext.Provider value={{
      activeSOS,
      sosHistory,
      dismissSOS,
      acceptMission,
      stopEmergencySound
    }}>
      {children}
    </SOSContext.Provider>
  );
};

export const useSOS = () => useContext(SOSContext);
