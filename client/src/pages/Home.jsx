import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SOSButton from '../components/SOSButton';
import MapView from '../components/MapView';
import EmergencyServicesList from '../components/EmergencyServicesList';
import LiveIncidentFeed from '../components/LiveIncidentFeed';
import StatBar from '../components/StatBar';
import useGeolocation from '../hooks/useGeolocation';
import api from '../services/api';
import { SocketContext } from '../context/SocketContext';

const Home = () => {
  const [incidents, setIncidents] = useState([]);
  const { location: userLocation } = useGeolocation();
  const [sharingLocation, setSharingLocation] = useState(false);
  const { socket } = useContext(SocketContext);

  useEffect(() => { document.title = 'SafeGuard — Emergency Response'; }, []);

  useEffect(() => {
    api.get('/incidents?status=active').then(res =>
      setIncidents(res.data?.incidents || res.data || [])
    );
  }, []);

  // Real-time: prepend new incidents to map
  useEffect(() => {
    if (!socket) return;

    const handleNewIncident = (newIncident) => {
      setIncidents(prev => [newIncident, ...prev]);
    };

    const handleUpdatedIncident = (updatedIncident) => {
      setIncidents(prev => prev.map(i => i._id === updatedIncident._id ? updatedIncident : i));
    };

    const handleDeletedIncident = ({ _id }) => {
      setIncidents(prev => prev.filter(i => i._id !== _id));
    };

    socket.on('incident:new', handleNewIncident);
    socket.on('incident:updated', handleUpdatedIncident);
    socket.on('incident:deleted', handleDeletedIncident);

    return () => {
      socket.off('incident:new');
      socket.off('incident:updated');
      socket.off('incident:deleted');
    };
  }, [socket]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background dark:bg-background-dark"
    >
      {/* HERO SECTION */}
      <section className="relative bg-navy dark:bg-navy-light text-white overflow-hidden py-16 lg:py-24">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" alt="Emergency Workers" className="w-full h-full object-cover" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2">
                <span className="block text-white">Together, We Respond.</span>
                <span className="block text-primary">Together, We Save Lives.</span>
              </h1>
              <p className="mt-4 text-xl text-gray-300 max-w-2xl">
                Real-time disaster alerts, quick response, and community support when it matters most.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-center sm:justify-start">
                 <SOSButton />
                 <span className="ml-4 font-bold text-xl text-white">EMERGENCY</span>
              </div>
              <Link 
                to="/report"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white rounded-lg text-lg font-bold text-white hover:bg-white hover:text-navy transition-colors h-16 mt-4 sm:mt-0"
              >
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                REPORT INCIDENT
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-safe rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-300">System Status: All Systems Operational</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 w-full h-[400px] lg:h-[500px]">
            <div className="bg-white dark:bg-navy p-2 rounded-xl shadow-2xl h-full relative border border-gray-800">
              <div className="absolute top-4 left-4 z-10 bg-white dark:bg-navy px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 text-sm font-bold text-navy dark:text-white">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                Live Incidents — {incidents.length} Active
              </div>
              
              <Link to="/map" className="absolute top-4 right-4 z-10 bg-white dark:bg-navy p-2 rounded shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </Link>

              <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                 <MapView incidents={incidents} />
              </div>

              <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center">
                <div className="bg-white/90 dark:bg-navy/90 backdrop-blur px-4 py-2 rounded-full shadow flex gap-4 text-xs font-medium">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Flood</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Fire</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Earthquake</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Accident</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* THREE COLUMN SECTION */}
      <section className="py-16 bg-background dark:bg-background-dark max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="h-[600px]">
            <EmergencyServicesList />
          </div>

          <div className="h-[600px]">
            <LiveIncidentFeed />
          </div>

          <div className="h-[600px] flex flex-col gap-6">
            
            {/* Action Card */}
            <div className="bg-primary rounded-xl shadow-lg p-6 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="z-10">
                <h3 className="text-2xl font-bold mb-2">Need Immediate Help?</h3>
                <p className="text-primary-100">Tap the SOS button to alert emergency services.</p>
              </div>
              <div className="z-10 transform scale-75">
                <SOSButton />
              </div>
            </div>

            {/* Location Share Toggle */}
            <div className="bg-white dark:bg-navy-light rounded-xl shadow-lg p-6 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-navy dark:text-white">Share Live Location</h4>
                <p className="text-sm text-gray-500">Help responders find you faster</p>
              </div>
              <button 
                onClick={() => setSharingLocation(!sharingLocation)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${sharingLocation ? 'bg-safe' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${sharingLocation ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Stay Prepared */}
            <div className="bg-white dark:bg-navy-light rounded-xl shadow-lg p-6 flex-1">
              <h4 className="font-bold text-navy dark:text-white mb-4">Stay Prepared</h4>
              <div className="grid grid-cols-2 gap-4 h-full">
                {['Safety Tips', 'Emergency Kit', 'Guidelines', 'Training'].map((item, i) => (
                  <Link key={i} to="/resources" className="bg-gray-50 dark:bg-navy p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                    <span className="text-2xl">{['💡','🎒','📜','🎓'][i]}</span>
                    <span className="text-sm font-semibold text-center text-navy dark:text-gray-300">{item}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <StatBar />

    </motion.div>
  );
};

export default Home;
