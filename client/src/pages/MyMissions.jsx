import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import PageWrapper from '../components/PageWrapper';

const STATUS_COLORS = {
  assigned: 'bg-slate-600/20 text-slate-400',
  accepted: 'bg-blue-600/20 text-blue-400',
  travelling: 'bg-amber-600/20 text-amber-400',
  reached: 'bg-emerald-600/20 text-emerald-400',
  helping: 'bg-purple-600/20 text-purple-400',
  completed: 'bg-green-600/20 text-green-400'
};

const MISSION_STATUS_COLORS = {
  active: 'bg-red-600/20 text-red-400',
  'in-progress': 'bg-amber-600/20 text-amber-400',
  resolved: 'bg-emerald-600/20 text-emerald-400',
  cancelled: 'bg-slate-600/20 text-slate-400'
};

const MyMissions = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    document.title = 'My Missions — SafeGuard';
    fetchMissions();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const uIdStr = user._id?.toString();

    const handleMissionUpdate = (data) => {
      const targetId = (data.mission?._id || data.missionId)?.toString();
      if (!targetId) return;
      if (data.mission) {
        setMissions(prev => {
          const exists = prev.some(m => m._id?.toString() === targetId);
          if (exists) {
            return prev.map(m => m._id?.toString() === targetId ? data.mission : m);
          }
          const isAssigned = data.mission.assignedVolunteers?.some(
            v => (v.volunteer?._id || v.volunteer)?.toString() === uIdStr
          );
          if (isAssigned) {
            return [data.mission, ...prev];
          }
          return prev;
        });
      } else {
        fetchMissions();
      }
    };

    const handleMissionCreated = (data) => {
      if (data.mission) {
        const isAssigned = data.mission.assignedVolunteers?.some(
          v => (v.volunteer?._id || v.volunteer)?.toString() === uIdStr
        );
        if (isAssigned) {
          setMissions(prev => {
            if (prev.some(m => m._id?.toString() === data.mission._id?.toString())) return prev;
            return [data.mission, ...prev];
          });
        }
      }
    };

    const handleSosAssigned = () => {
      fetchMissions();
    };

    socket.on('mission:updated', handleMissionUpdate);
    socket.on('mission:status-changed', handleMissionUpdate);
    socket.on('mission:created', handleMissionCreated);
    socket.on('sos:assigned', handleSosAssigned);

    return () => {
      socket.off('mission:updated', handleMissionUpdate);
      socket.off('mission:status-changed', handleMissionUpdate);
      socket.off('mission:created', handleMissionCreated);
      socket.off('sos:assigned', handleSosAssigned);
    };
  }, [socket, user]);

  const fetchMissions = async () => {
    try {
      const res = await api.get('/missions/my-missions');
      setMissions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch missions', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (missionId, status) => {
    try {
      const res = await api.patch(`/missions/${missionId}/status`, { status });
      setMissions(prev => prev.map(m => m._id === missionId ? res.data : m));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const openGoogleMaps = (location) => {
    if (!location) return;
    const lat = location.coordinates?.[1] || location.lat;
    const lng = location.coordinates?.[0] || location.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  const getMyVolunteerStatus = (mission) => {
    const vol = mission.assignedVolunteers?.find(
      v => (v.volunteer?._id || v.volunteer) === user?._id
    );
    return vol?.status || 'assigned';
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-navy-light text-gray-900 dark:text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy dark:text-white">My Missions</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage your assigned emergency missions</p>
            </div>
            <button
              onClick={fetchMissions}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ))}
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🆘</div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">No Missions Yet</h2>
              <p className="text-gray-500 dark:text-gray-400">
                When you're assigned to an emergency, your missions will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {missions.map(mission => (
                <motion.div
                  key={mission._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-navy border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-navy dark:text-white">{mission.missionId}</h2>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold capitalize ${MISSION_STATUS_COLORS[mission.status] || ''}`}>
                          {mission.status}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {mission.userName} — {mission.address || 'Location captured'}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        {new Date(mission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Current status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Your status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[getMyVolunteerStatus(mission)] || ''}`}>
                      {getMyVolunteerStatus(mission)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openGoogleMaps(mission.location)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Open in Maps
                    </button>

                    {mission.status !== 'resolved' && mission.status !== 'cancelled' && (
                      <select
                        value={getMyVolunteerStatus(mission)}
                        onChange={(e) => updateStatus(mission._id, e.target.value)}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm cursor-pointer focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="accepted">Accepted</option>
                        <option value="travelling">Travelling</option>
                        <option value="reached">Reached</option>
                        <option value="helping">Helping</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}

                    {mission.user?.phone && (
                      <a
                        href={`tel:${mission.user.phone}`}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium border border-gray-300 dark:border-gray-600"
                      >
                        Call User
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default MyMissions;
