import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import IncidentCard from '../components/IncidentCard';
import PageWrapper from '../components/PageWrapper';
import MapView from '../components/MapView';
import Toast from '../components/Toast';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Volunteer application & profile state
  const [volunteerData, setVolunteerData] = useState(null);
  const [volunteerLoading, setVolunteerLoading] = useState(true);
  
  // Settings Form state
  const [settingsForm, setSettingsForm] = useState({
    availability: true,
    skills: [],
    preferredContact: 'email',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bio: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Nearby Incidents state
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyIncidents, setNearbyIncidents] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    document.title = 'Dashboard — SafeGuard';
    fetchVolunteerProfile();
  }, []);

  const fetchVolunteerProfile = () => {
    setVolunteerLoading(true);
    api.get('/volunteers/me')
      .then(res => {
        setVolunteerData(res.data);
      })
      .catch(err => {
        console.error('Error fetching volunteer profile:', err);
      })
      .finally(() => {
        setVolunteerLoading(false);
      });
  };

  // Sync settings form on volunteer profile load
  useEffect(() => {
    if (volunteerData) {
      setSettingsForm({
        availability: volunteerData.availability ?? true,
        skills: volunteerData.skills || [],
        preferredContact: volunteerData.preferredContact || 'email',
        emergencyContactName: volunteerData.emergencyContactName || '',
        emergencyContactPhone: volunteerData.emergencyContactPhone || '',
        bio: volunteerData.bio || ''
      });
    }
  }, [volunteerData]);

  // Real-time socket approval updates
  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = ({ status }) => {
      setVolunteerData(prev => prev ? { ...prev, status } : null);
      if (status === 'approved') {
        setToast({ show: true, message: 'Your volunteer application was approved!', type: 'success' });
      } else if (status === 'rejected') {
        setToast({ show: true, message: 'Your volunteer application was rejected.', type: 'error' });
      }
    };
    socket.on('volunteer:statusUpdated', handleStatusUpdate);
    return () => socket.off('volunteer:statusUpdated', handleStatusUpdate);
  }, [socket]);

  // Fetch reports when tab opens
  useEffect(() => {
    if (activeTab === 'reports') {
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

  // Handle Geolocation and Nearby Incidents
  useEffect(() => {
    if (activeTab === 'nearby') {
      setNearbyLoading(true);
      setGeoError(null);
      if (!navigator.geolocation) {
        setGeoError('Geolocation is not supported by your browser.');
        setNearbyLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLoc({ lat, lng });
          api.get(`/incidents?lat=${lat}&lng=${lng}&radius=10`)
            .then(res => {
              setNearbyIncidents(res.data || []);
            })
            .catch(err => {
              console.error(err);
            })
            .finally(() => {
              setNearbyLoading(false);
            });
        },
        (error) => {
          setGeoError('Geolocation access denied. Please enable location permissions to see nearby incidents.');
          setNearbyLoading(false);
        }
      );
    }
  }, [activeTab]);

  const handleRegister = async () => {
    setVolunteerLoading(true);
    try {
      const res = await api.post('/volunteers/register', { skills: [] });
      setVolunteerData(res.data);
      setToast({ show: true, message: 'Application submitted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: err.response?.data?.message || 'Registration failed', type: 'error' });
    } finally {
      setVolunteerLoading(false);
    }
  };

  const handleActivityStatusChange = async (e) => {
    try {
      const val = e.target.value;
      const res = await api.put('/volunteers/status', { status: val });
      setVolunteerData(prev => ({ ...prev, activityStatus: res.data.activityStatus }));
      setToast({ show: true, message: `Status updated to ${val}`, type: 'success' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!volunteerData) return;
    try {
      const res = await api.patch(`/volunteers/${volunteerData._id}`, settingsForm);
      setVolunteerData(res.data);
      setToast({ show: true, message: 'Settings saved successfully!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to save settings.', type: 'error' });
    }
  };

  const toggleSkill = (skill) => {
    setSettingsForm(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const availableSkills = ['Fire Rescue', 'Medical Aid', 'Flood Relief', 'Evacuation', 'Search & Rescue', 'Logistics'];

  return (
    <PageWrapper className="mx-auto flex max-w-7xl flex-col gap-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8 md:flex-row">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}

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
              {tab === 'nearby' ? 'Nearby Incidents' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-navy-light rounded-xl shadow p-4 md:p-6 min-h-[500px]">
        
        {/* TAB 1: REPORTS */}
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

        {/* TAB 2: NEARBY INCIDENTS */}
        {activeTab === 'nearby' && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Nearby Incidents (Within 10km)</h2>
            {nearbyLoading ? (
              <div className="space-y-4">
                <div className="h-64 rounded-xl bg-gray-200 animate-pulse dark:bg-gray-700 mb-6" />
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : geoError ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📍</div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">Location Access Required</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">{geoError}</p>
              </div>
            ) : (
              <div>
                {userLoc && (
                  <div className="h-64 md:h-80 w-full mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 z-0 relative">
                    <MapView incidents={nearbyIncidents} userLocation={userLoc} />
                  </div>
                )}
                {nearbyIncidents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🛡️</div>
                    <p className="text-gray-500 dark:text-gray-400 font-semibold">No incidents reported near you</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nearbyIncidents.map(inc => (
                      <IncidentCard key={inc._id} incident={inc} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VOLUNTEER DASHBOARD */}
        {activeTab === 'volunteer' && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Volunteer Dashboard</h2>
            {volunteerLoading ? (
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>
            ) : !volunteerData ? (
              <div className="bg-gray-50 dark:bg-navy p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">Become a Volunteer</h3>
                <p className="text-gray-500 mb-6">Join the response team and help your community during crises.</p>
                <button 
                  onClick={handleRegister}
                  className="min-h-[44px] rounded bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-dark"
                >
                  Register Now
                </button>
              </div>
            ) : volunteerData.status === 'pending' ? (
              <div className="border border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-950/20 p-6 rounded-xl text-center">
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-400 mb-2">Application Under Review</h3>
                <p className="text-yellow-700 dark:text-yellow-500">Your volunteer application is under review. You will be notified once approved.</p>
              </div>
            ) : volunteerData.status === 'rejected' ? (
              <div className="border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20 p-6 rounded-xl text-center">
                <div className="text-4xl mb-4">❌</div>
                <h3 className="font-bold text-lg text-red-800 dark:text-red-400 mb-2">Application Rejected</h3>
                <p className="text-red-700 dark:text-red-500">Your application was rejected. Contact admin for more information.</p>
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
                    <select 
                      value={volunteerData.activityStatus || 'available'}
                      onChange={handleActivityStatusChange}
                      className="w-full bg-transparent font-bold text-lg outline-none cursor-pointer text-gray-900 dark:text-white h-11"
                    >
                      <option value="available" className="bg-white text-gray-900 dark:bg-navy dark:text-white">Available</option>
                      <option value="en-route" className="bg-white text-gray-900 dark:bg-navy dark:text-white">En Route</option>
                      <option value="on-site" className="bg-white text-gray-900 dark:bg-navy dark:text-white">On Site</option>
                    </select>
                  </motion.div>
                  <motion.div
                    className="flex-1 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-400 font-bold mb-1">Assigned Tasks</p>
                    <p className="font-bold text-2xl text-navy dark:text-white">
                      {volunteerData.assignedIncidents?.length || 0}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Volunteer Settings</h2>
            {volunteerLoading ? (
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>
            ) : !volunteerData || volunteerData.status !== 'approved' ? (
              <div className="bg-gray-50 dark:bg-navy p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">Settings Restricted</h3>
                <p className="text-gray-500">Settings are only available for approved volunteers. Please complete registration and wait for approval.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="font-bold text-navy dark:text-white">Operational Availability</h4>
                    <p className="text-xs text-gray-500">Toggle whether you are available for dispatch</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSettingsForm(prev => ({ ...prev, availability: !prev.availability }))}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${settingsForm.availability ? 'bg-safe' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${settingsForm.availability ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {/* Skills Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Skills &amp; Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map(skill => {
                      const isSelected = settingsForm.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`min-h-[40px] px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            isSelected 
                              ? 'bg-primary border-primary text-white shadow' 
                              : 'bg-white dark:bg-navy border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Contact */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Preferred Contact Method</label>
                  <select
                    value={settingsForm.preferredContact}
                    onChange={e => setSettingsForm(prev => ({ ...prev, preferredContact: e.target.value }))}
                    className="w-full h-11 p-2 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={settingsForm.emergencyContactName}
                      onChange={e => setSettingsForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={settingsForm.emergencyContactPhone}
                      onChange={e => setSettingsForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bio / Short Description</label>
                  <textarea
                    value={settingsForm.bio}
                    onChange={e => setSettingsForm(prev => ({ ...prev, bio: e.target.value.slice(0, 200) }))}
                    rows={4}
                    maxLength={200}
                    className="w-full p-3 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Short bio (maximum 200 characters)..."
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {settingsForm.bio.length} / 200 characters
                  </div>
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors shadow-lg"
                >
                  Save Settings
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default Dashboard;
