import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import IncidentCard from '../components/IncidentCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [volunteerStatus, setVolunteerStatus] = useState(null);

  useEffect(() => {
    if(activeTab === 'reports') {
      api.get('/users/reports').then(res => setReports(res.data)).catch(console.error);
    }
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-white dark:bg-navy-light rounded-xl shadow p-6 mb-6 text-center">
          <div className="w-20 h-20 bg-primary text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {user?.name?.charAt(0)}
          </div>
          <h2 className="font-bold text-lg text-navy dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wide">
            {user?.role}
          </span>
        </div>

        <nav className="flex flex-col gap-2">
          {['reports', 'nearby', 'volunteer', 'settings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-navy-light rounded-xl shadow p-6 min-h-[500px]">
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">My Reports</h2>
            {reports.length === 0 ? (
              <p className="text-gray-500">You haven't reported any incidents yet.</p>
            ) : (
              <div className="space-y-4">
                {reports.map(rep => <IncidentCard key={rep._id} incident={rep} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'volunteer' && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Volunteer Dashboard</h2>
            {user?.role !== 'volunteer' ? (
              <div className="bg-gray-50 dark:bg-navy p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">Become a Volunteer</h3>
                <p className="text-gray-500 mb-6">Join the response team and help your community during crises.</p>
                <button 
                  onClick={async () => {
                    await api.post('/volunteers/register', { skills: ['first-aid'] });
                    window.location.reload();
                  }}
                  className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-dark transition-colors"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex-1 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-400 font-bold mb-1">Current Status</p>
                    <select className="w-full bg-transparent font-bold text-lg outline-none cursor-pointer text-navy dark:text-white" onChange={(e) => api.put('/volunteers/status', { status: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="en-route">En Route</option>
                      <option value="on-site">On Site</option>
                    </select>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex-1 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-400 font-bold mb-1">Assigned Tasks</p>
                    <p className="font-bold text-2xl text-navy dark:text-white">0</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'nearby' || activeTab === 'settings') && (
          <div className="flex items-center justify-center h-64 text-gray-500">
             Content for {activeTab} coming soon...
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
