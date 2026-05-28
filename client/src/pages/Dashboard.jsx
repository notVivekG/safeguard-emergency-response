import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import IncidentCard from '../components/IncidentCard';
import PageWrapper from '../components/PageWrapper';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volunteerStatus, setVolunteerStatus] = useState(null);

  useEffect(() => { document.title = 'Dashboard — SafeGuard'; }, []);

  useEffect(() => {
    if(activeTab === 'reports') {
      setLoading(true);
      api.get('/users/reports')
        .then(res => {
          setReports(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  return (
    <PageWrapper className="mx-auto flex max-w-7xl flex-col gap-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8 md:flex-row">
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

        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-none whitespace-nowrap">
          {['reports', 'nearby', 'volunteer', 'settings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-[44px] shrink-0 rounded-lg px-4 py-3 text-center font-medium transition-colors md:text-left ${
                activeTab === tab ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-navy-light rounded-xl shadow p-4 md:p-6 min-h-[500px]">
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">My Reports</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">No Reports Yet</h3>
                <p className="text-gray-500 mb-6">You have not reported any incidents yet.</p>
                <Link to="/report" className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">
                  Report an Incident
                </Link>
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                initial="hidden"
                animate="show"
              >
                {reports.map(rep => (
                  <motion.div
                    key={rep._id}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.2 }}
                  >
                    <IncidentCard incident={rep} />
                  </motion.div>
                ))}
              </motion.div>
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
                  className="min-h-[44px] rounded bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-dark"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <motion.div
                className="space-y-6"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                initial="hidden"
                animate="show"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <motion.div
                    className="flex-1 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  >
                    <p className="text-sm text-green-800 dark:text-green-400 font-bold mb-1">Current Status</p>
                    <select className="w-full bg-transparent font-bold text-lg outline-none cursor-pointer text-navy dark:text-white h-11" onChange={(e) => api.put('/volunteers/status', { status: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="en-route">En Route</option>
                      <option value="on-site">On Site</option>
                    </select>
                  </motion.div>
                  <motion.div
                    className="flex-1 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-400 font-bold mb-1">Assigned Tasks</p>
                    <p className="font-bold text-2xl text-navy dark:text-white">0</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {(activeTab === 'nearby' || activeTab === 'settings') && (
          <div className="flex items-center justify-center h-64 text-gray-500">
             Content for {activeTab} coming soon...
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
