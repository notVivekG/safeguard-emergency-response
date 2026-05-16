import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import MapView from '../components/MapView';
import useIncidents from '../hooks/useIncidents';
import IncidentCard from '../components/IncidentCard';
import Toast from '../components/Toast';
import { SocketContext } from '../context/SocketContext';
import useGeolocation from '../hooks/useGeolocation';

const LiveMap = () => {
  const [filters, setFilters] = useState({ status: 'active' });
  const { incidents, loading } = useIncidents(filters);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const { socket } = useContext(SocketContext);
  const [toastMsg, setToastMsg] = useState(null);
  const { location: userLocation } = useGeolocation();

  useEffect(() => {
    if(socket) {
      socket.on('incident:new', (incident) => {
        setToastMsg(`New ${incident.type} alert reported near you!`);
      });
    }
    return () => socket && socket.off('incident:new');
  }, [socket]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden"
    >
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white dark:bg-navy-light shadow-xl z-10 flex flex-col h-1/2 md:h-full border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-navy dark:text-white mb-4">Filters</h2>
          
          <select 
            className="w-full p-2 mb-3 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
          >
            <option value="">All Incident Types</option>
            <option value="fire">Fire</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="accident">Accident</option>
            <option value="medical">Medical</option>
          </select>

          <select 
            className="w-full p-2 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setFilters(prev => ({...prev, severity: e.target.value}))}
          >
            <option value="">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#010409]">
          {loading ? (
             <div className="text-center text-gray-500 py-4">Loading incidents...</div>
          ) : incidents.length === 0 ? (
             <div className="text-center text-gray-500 py-4">No incidents found.</div>
          ) : (
            incidents.map(inc => (
              <IncidentCard key={inc._id} incident={inc} />
            ))
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative h-1/2 md:h-full z-0">
        <div className="absolute top-4 right-4 z-[400] flex gap-2">
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-4 py-2 rounded-lg shadow-md font-bold transition-colors ${showHeatmap ? 'bg-primary text-white' : 'bg-white text-navy hover:bg-gray-100'}`}
          >
            Heatmap View
          </button>
        </div>
        <MapView incidents={incidents} showHeatmap={showHeatmap} userLocation={userLocation} />
      </div>

      {toastMsg && (
        <Toast message={toastMsg} type="warning" onClose={() => setToastMsg(null)} />
      )}
    </motion.div>
  );
};

export default LiveMap;
