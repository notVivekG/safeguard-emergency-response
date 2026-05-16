import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import useIncidents from '../hooks/useIncidents';
import IncidentCard from '../components/IncidentCard';
import SeverityBadge from '../components/SeverityBadge';

const Alerts = () => {
  const [filters, setFilters] = useState({ status: '' });
  const { incidents, loading } = useIncidents(filters);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightId = searchParams.get('id');

  const [selectedIncident, setSelectedIncident] = useState(null);

  React.useEffect(() => {
    if (highlightId && incidents.length > 0) {
      const inc = incidents.find(i => i._id === highlightId);
      if (inc) setSelectedIncident(inc);
    }
  }, [highlightId, incidents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">Emergency Alerts</h1>
          <p className="text-gray-500">View and track all reported incidents.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-navy dark:text-white outline-none"
            onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
          <select 
            className="flex-1 md:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-navy dark:text-white outline-none"
            onChange={e => setFilters(prev => ({...prev, severity: e.target.value}))}
          >
            <option value="">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
           ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-navy rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 bg-gray-50 dark:bg-navy-light rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-navy dark:text-white mb-2">No alerts found</h3>
          <p className="text-gray-500 mb-8 max-w-md">Be the first to report an incident in your area.</p>
          <Link to="/report" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors">
            Report Incident
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {incidents.map((incident, i) => (
              <motion.div 
                key={incident._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedIncident(incident)}
                className="cursor-pointer"
              >
                <IncidentCard incident={incident} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-navy-light w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start sticky top-0 bg-white dark:bg-navy-light z-10">
                <div>
                  <h2 className="text-2xl font-bold text-navy dark:text-white">{selectedIncident.title}</h2>
                  <p className="text-gray-500 capitalize">{selectedIncident.type} • ID: {selectedIncident._id}</p>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex gap-2">
                  <SeverityBadge severity={selectedIncident.severity} />
                  <span className="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800">{selectedIncident.status}</span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedIncident.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</h3>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-navy p-3 rounded">{selectedIncident.address}</p>
                </div>

                {selectedIncident.aiPrediction && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded border border-purple-100 dark:border-purple-800">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-1 flex items-center gap-2">
                      <span className="text-xl">🤖</span> AI Assessment
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-400">{selectedIncident.aiPrediction.reasoning}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Timeline</h3>
                  <div className="space-y-4">
                    {selectedIncident.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-px bg-gray-300 dark:bg-gray-600 relative ml-2">
                          <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-white dark:ring-navy-light"></div>
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-navy dark:text-white">{event.action}</p>
                          <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Alerts;
