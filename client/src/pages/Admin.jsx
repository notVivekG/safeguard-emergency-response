import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-navy text-white rounded-xl shadow-lg p-6 flex flex-col shrink-0">
        <h2 className="font-bold text-xl mb-8 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          Admin Panel
        </h2>
        <nav className="flex flex-col gap-2 flex-1">
          {['overview', 'incidents', 'users', 'broadcast', 'export'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-navy-light rounded-xl shadow p-8 overflow-y-auto">
        {activeTab === 'overview' && stats && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Overview Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-400 font-bold mb-2">Total Incidents</p>
                <p className="text-4xl font-bold text-navy dark:text-white">{stats.totalIncidents}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-400 font-bold mb-2">Active Incidents</p>
                <p className="text-4xl font-bold text-navy dark:text-white">{stats.activeIncidents}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-400 font-bold mb-2">Resolved</p>
                <p className="text-4xl font-bold text-navy dark:text-white">{stats.resolvedIncidents}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-400 font-bold mb-2">Total Users</p>
                <p className="text-4xl font-bold text-navy dark:text-white">{stats.totalUsers}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-purple-800 dark:text-purple-400 font-bold mb-2">Active Volunteers</p>
                <p className="text-4xl font-bold text-navy dark:text-white">{stats.activeVolunteers}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab !== 'overview' && (
           <div className="flex items-center justify-center h-full text-gray-500">
             {activeTab.toUpperCase()} management coming soon.
           </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
