import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import useIncidents from '../hooks/useIncidents';
import IncidentCard from '../components/IncidentCard';
import SeverityBadge from '../components/SeverityBadge';
import PageWrapper from '../components/PageWrapper';

const Alerts = () => {
  const [filters, setFilters] = useState({ status: '' });
  const { incidents, loading } = useIncidents(filters);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const highlightId = searchParams.get('id');

  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => { document.title = 'Alerts — SafeGuard'; }, []);

  useEffect(() => {
    if (highlightId && incidents.length > 0) {
      const inc = incidents.find(i => i._id === highlightId);
      if (inc) setSelectedIncident(inc);
    }
  }, [highlightId, incidents]);

  return (
    <PageWrapper className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white mb-2">Emergency Alerts</h1>
          <p className="text-gray-500">View and track all reported incidents.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
          <select 
            className="flex-1 md:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-navy dark:text-white outline-none h-11 shrink-0"
            onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
          <select 
            className="flex-1 md:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-navy dark:text-white outline-none h-11 shrink-0"
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
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">All Clear</h3>
          <p className="text-gray-500 mb-6">No active incidents reported in your area.</p>
          <Link to="/report" className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">
            Report an Incident
          </Link>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {incidents.map((incident, index) => (
              <motion.div 
                key={incident._id}
                variants={{
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-navy-light w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl overflow-y-auto rounded-none md:rounded-xl shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start sticky top-0 bg-white dark:bg-navy-light z-10">
                <div>
                  <h2 className="text-2xl font-bold text-navy dark:text-white">{selectedIncident.title}</h2>
                  <p className="text-gray-500 capitalize text-sm">{selectedIncident.type} • ID: {selectedIncident._id}</p>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 w-10 h-10 flex items-center justify-center font-bold">
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
    </PageWrapper>
  );
};

export default Alerts;
