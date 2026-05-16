import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import IncidentCard from './IncidentCard';
import SkeletonLoader from './SkeletonLoader';
import { Link } from 'react-router-dom';

const LiveIncidentFeed = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    fetchIncidents();
    
    if (!socket) return;

    const handleNewIncident = (incident) => {
      setIncidents(prev => [incident, ...prev].slice(0, 10));
    };

    const handleDeletedIncident = ({ _id }) => {
      setIncidents(prev => prev.filter(i => i._id !== _id));
    };

    const handleUpdatedIncident = (updated) => {
      setIncidents(prev => prev.map(i => i._id === updated._id ? updated : i));
    };

    socket.on('incident:new', handleNewIncident);
    socket.on('incident:deleted', handleDeletedIncident);
    socket.on('incident:updated', handleUpdatedIncident);

    return () => {
      socket.off('incident:new', handleNewIncident);
      socket.off('incident:deleted', handleDeletedIncident);
      socket.off('incident:updated', handleUpdatedIncident);
    };
  }, [socket]);

  const fetchIncidents = async () => {
    try {
      const { data } = await api.get('/incidents?status=active');
      setIncidents(data.slice(0, 5)); // show recent 5
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-light rounded-xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-navy dark:text-white flex items-center gap-2">
          Live Incident Feed
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </h2>
        <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-full">● Live</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {loading ? (
          <>
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
          </>
        ) : incidents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active incidents.</p>
        ) : (
          <AnimatePresence>
            {incidents.map((incident) => (
              <motion.div
                key={incident._id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <IncidentCard incident={incident} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Link to="/alerts" className="block w-full text-center text-primary font-medium hover:text-primary-dark transition-colors">
          View All Incidents →
        </Link>
      </div>
    </div>
  );
};

export default LiveIncidentFeed;
