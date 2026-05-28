import React, { useState, useEffect, useContext } from 'react';
import MapView from '../components/MapView';
import useIncidents from '../hooks/useIncidents';
import IncidentCard from '../components/IncidentCard';
import Toast from '../components/Toast';
import { SocketContext } from '../context/SocketContext';
import useGeolocation from '../hooks/useGeolocation';
import PageWrapper from '../components/PageWrapper';

const LiveMap = () => {
  const [filters, setFilters] = useState({ status: 'active' });
  const { incidents: fetchedIncidents, loading } = useIncidents(filters);
  const [incidents, setIncidents] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { socket } = useContext(SocketContext);
  const [toastMsg, setToastMsg] = useState(null);
  const { location: userLocation } = useGeolocation();

  useEffect(() => { document.title = 'Live Map — SafeGuard'; }, []);

  const clearFilters = () => setFilters({ status: 'active' });

  // Sync fetched incidents into local state so we can update via socket
  useEffect(() => {
    setIncidents(fetchedIncidents);
  }, [fetchedIncidents]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    socket.on('incident:new', (newIncident) => {
      setToastMsg(`New ${newIncident.type} alert: ${newIncident.title}`);
      setIncidents(prev => [newIncident, ...prev]);
    });
    socket.on('incident:updated', (updated) => {
      setIncidents(prev => prev.map(i => i._id === updated._id ? updated : i));
    });
    socket.on('incident:deleted', ({ _id }) => {
      setIncidents(prev => prev.filter(i => i._id !== _id));
    });
    return () => {
      socket.off('incident:new');
      socket.off('incident:updated');
      socket.off('incident:deleted');
    };
  }, [socket]);

  return (
    <PageWrapper className="relative flex h-[calc(100vh-64px)] flex-col overflow-hidden md:flex-row">
      {/* Backdrop overlay on mobile */}
      {showSidebar && (
        <div 
          onClick={() => setShowSidebar(false)} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden mt-16"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative top-16 md:top-0 bottom-0 left-0 z-50 md:z-10 w-80 max-w-[80vw] md:max-w-none bg-white dark:bg-navy-light shadow-xl flex flex-col h-[calc(100vh-80px)] md:h-full border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ${
        showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-navy dark:text-white mb-4">Filters</h2>
          
          <select 
            className="w-full p-2 mb-3 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary h-11"
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
            className="w-full p-2 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary h-11"
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
            <div className="space-y-3 p-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : incidents.length === 0 ? (
             <div className="text-center py-8 px-4">
               <div className="text-4xl mb-3">🗺️</div>
               <p className="text-gray-500 text-sm">No incidents match your current filters.</p>
               <button onClick={clearFilters} className="mt-3 text-red-600 text-sm hover:underline">
                 Clear filters
               </button>
             </div>
          ) : (
            incidents.map(inc => (
              <IncidentCard key={inc._id} incident={inc} />
            ))
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative h-full md:h-full z-0">
        <div className="absolute top-4 right-4 z-[400] flex gap-2">
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-4 py-2 rounded-lg shadow-md font-bold transition-colors ${showHeatmap ? 'bg-primary text-white' : 'bg-white text-navy hover:bg-gray-100'} h-11`}
          >
            Heatmap View
          </button>
        </div>
        <MapView incidents={incidents} showHeatmap={showHeatmap} userLocation={userLocation} />
      </div>

      {/* Floating Toggle Sidebar Button on Mobile */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed bottom-6 right-6 z-[500] bg-primary hover:bg-primary-dark text-white font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-primary-light h-12"
      >
        <span>📋</span>
        <span>{showSidebar ? 'Hide List' : 'Show List'}</span>
      </button>

      {toastMsg && (
        <Toast message={toastMsg} type="warning" onClose={() => setToastMsg(null)} />
      )}
    </PageWrapper>
  );
};

export default LiveMap;
