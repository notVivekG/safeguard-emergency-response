import React, { useContext, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import IncidentCard from '../components/IncidentCard';
import PageWrapper from '../components/PageWrapper';
import MapView from '../components/MapView';
import Toast from '../components/Toast';

// Status badge helper for tasks
const taskStatusBadge = {
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const Dashboard = () => {
  const { user, setUser, updateUserProfile } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile editing state
  const [profileForm, setProfileForm] = useState({ name: '' });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

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

  // SOS alert banner (for volunteers)
  const [sosBanner, setSosBanner] = useState(null);
  const sosBannerTimerRef = useRef(null);

  // SOS assignment banner (for volunteers)
  const [sosAssignmentBanner, setSosAssignmentBanner] = useState(null);
  const sosAssignmentBannerTimerRef = useRef(null);

  // SOS alarm refs
  const alarmIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Tasks tab state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const startSOSAlarm = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const playDoubleBeep = () => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'square';
      osc1.frequency.value = 880;
      gain1.gain.setValueAtTime(0.3, now);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Beep 2 (after 100ms gap)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'square';
      osc2.frequency.value = 880;
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.4);
    };

    playDoubleBeep();
    alarmIntervalRef.current = setInterval(playDoubleBeep, 600);
  };

  const stopSOSAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await api.patch('/users/profile', { name: profileForm.name });
      updateUserProfile({ name: res.data.name });
      showToast('Profile updated successfully', 'success');
      setProfileEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

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

  // ── Socket event listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Volunteer status approval/rejection
    const handleStatusUpdate = ({ status }) => {
      setVolunteerData(prev => prev ? { ...prev, status } : null);
      if (status === 'approved') {
        showToast('Your volunteer application was approved!', 'success');
      } else if (status === 'rejected') {
        showToast('Your volunteer application was rejected.', 'error');
      }
    };

    // Task 5: Admin role update → live sync
    const handleRoleUpdated = ({ newRole }) => {
      if (!newRole) return;
      setUser(prev => ({ ...prev, role: newRole }));
      
      if (newRole === 'user') {
        // Reset volunteer state when demoted to user
        setVolunteerData(null);
        setSettingsForm({
          availability: true,
          skills: [],
          preferredContact: 'email',
          emergencyContactName: '',
          emergencyContactPhone: '',
          bio: ''
        });
        setActiveTab('reports');
        showToast('Your role has been updated. You are no longer a volunteer.', 'success');
      } else if (newRole === 'volunteer') {
        // Re-fetch volunteer profile when promoted to volunteer
        fetchVolunteerProfile();
        showToast('You have been registered as a volunteer by admin.', 'success');
      } else {
        showToast('Your role has been updated by admin.', 'success');
      }
    };

    // Handle volunteer deactivation
    const handleVolunteerDeactivated = () => {
      setVolunteerData(null);
      setSettingsForm({
        availability: true,
        skills: [],
        preferredContact: 'email',
        emergencyContactName: '',
        emergencyContactPhone: '',
        bio: ''
      });
      setActiveTab('reports');
      showToast('Your volunteer registration has been removed by admin. You can register again.', 'error');
    };

    // Handle volunteer approved (for admin-assigned volunteers)
    const handleVolunteerApproved = () => {
      fetchVolunteerProfile();
      showToast('You have been approved as a volunteer by admin.', 'success');
    };

    // Task 4: SOS alert banner for approved volunteers
    const handleSosAlert = (payload) => {
      if (user?.role !== 'volunteer' || volunteerData?.status !== 'approved') return;
      const { userName, address, location, timestamp } = payload;
      startSOSAlarm();
      setSosBanner({ userName, address, location, timestamp });
      clearTimeout(sosBannerTimerRef.current);
      sosBannerTimerRef.current = setTimeout(() => {
        stopSOSAlarm();
        setSosBanner(null);
      }, 60000);
    };

    // Handle SOS assignment
    const handleSosAssigned = (payload) => {
      if (volunteerData?.status !== 'approved') return;
      setSosAssignmentBanner(payload);
      clearTimeout(sosAssignmentBannerTimerRef.current);
      sosAssignmentBannerTimerRef.current = setTimeout(() => setSosAssignmentBanner(null), 60000);
      showToast('You have been assigned to an SOS emergency.', 'error');
    };

    // Task 6: New task assigned
    const handleTaskAssigned = (task) => {
      setTasks(prev => [task, ...prev]);
      showToast(`New task assigned: ${task.title}`, 'success');
    };

    // Task 6: Task status updated
    const handleTaskStatusUpdated = ({ taskId, status }) => {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
    };

    socket.on('volunteer:statusUpdated', handleStatusUpdate);
    socket.on('user:roleUpdated', handleRoleUpdated);
    socket.on('volunteer:deactivated', handleVolunteerDeactivated);
    socket.on('volunteer:approved', handleVolunteerApproved);
    socket.on('sos:alert', handleSosAlert);
    socket.on('sos:assigned', handleSosAssigned);
    socket.on('task:assigned', handleTaskAssigned);
    socket.on('task:statusUpdated', handleTaskStatusUpdated);

    return () => {
      socket.off('volunteer:statusUpdated', handleStatusUpdate);
      socket.off('user:roleUpdated', handleRoleUpdated);
      socket.off('volunteer:deactivated', handleVolunteerDeactivated);
      socket.off('volunteer:approved', handleVolunteerApproved);
      socket.off('sos:alert', handleSosAlert);
      socket.off('sos:assigned', handleSosAssigned);
      socket.off('task:assigned', handleTaskAssigned);
      socket.off('task:statusUpdated', handleTaskStatusUpdated);
    };
  }, [socket, volunteerData, setUser]);

  // Cleanup SOS banner timer on unmount
  useEffect(() => {
    return () => clearTimeout(sosBannerTimerRef.current);
  }, []);

  // Cleanup SOS assignment banner timer on unmount
  useEffect(() => {
    return () => clearTimeout(sosAssignmentBannerTimerRef.current);
  }, []);

  // Cleanup alarm on unmount
  useEffect(() => {
    return () => stopSOSAlarm();
  }, []);

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
        () => {
          setGeoError('Geolocation access denied. Please enable location permissions to see nearby incidents.');
          setNearbyLoading(false);
        }
      );
    }
  }, [activeTab]);

  // Fetch tasks when tasks tab opens
  useEffect(() => {
    if (activeTab === 'tasks') {
      setTasksLoading(true);
      api.get('/volunteers/tasks')
        .then(res => setTasks(res.data || []))
        .catch(console.error)
        .finally(() => setTasksLoading(false));
    }
  }, [activeTab]);

  const handleRegister = async () => {
    setVolunteerLoading(true);
    try {
      const res = await api.post('/volunteers/register', { skills: [] });
      setVolunteerData(res.data);
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setVolunteerLoading(false);
    }
  };

  const handleActivityStatusChange = async (e) => {
    try {
      const val = e.target.value;
      const res = await api.put('/volunteers/status', { status: val });
      setVolunteerData(prev => ({ ...prev, activityStatus: res.data.activityStatus }));
      showToast(`Status updated to ${val}`, 'success');
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
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings.', 'error');
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

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/volunteers/tasks/${taskId}/status`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
      showToast(`Task marked as ${newStatus.replace('-', ' ')}`, 'success');
    } catch (err) {
      showToast('Failed to update task status.', 'error');
    }
  };

  const availableSkills = ['Fire Rescue', 'Medical Aid', 'Flood Relief', 'Evacuation', 'Search & Rescue', 'Logistics'];

  // Tabs shown depend on role
  const allTabs = ['reports', 'nearby', 'volunteer', 'tasks', 'settings'];

  return (
    <PageWrapper className="mx-auto flex max-w-7xl flex-col gap-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8 md:flex-row">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}

      {/* SOS Banner for approved volunteers */}
      {sosBanner && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[9999] bg-red-600 text-white shadow-2xl md:rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl animate-pulse">🚨</span>
            <h3 className="text-xl font-black uppercase tracking-wide">EMERGENCY SOS ALERT</h3>
          </div>
          <p className="text-lg font-bold mb-4">
            <span className="font-black">{sosBanner.userName}</span> needs immediate help!
          </p>
          <div className="space-y-2 text-sm mb-6">
            <p>📍 Location: {sosBanner.address || 'Unknown'}</p>
            <p>🕐 Time: {sosBanner.timestamp ? new Date(sosBanner.timestamp).toLocaleString() : 'Unknown'}</p>
            <p>🗺 Coordinates: {sosBanner.location?.lat?.toFixed(6) || 'N/A'}, {sosBanner.location?.lng?.toFixed(6) || 'N/A'}</p>
          </div>
          <button
            onClick={() => {
              stopSOSAlarm();
              clearTimeout(sosBannerTimerRef.current);
              setSosBanner(null);
            }}
            className="w-full md:w-auto bg-white text-red-600 font-black rounded-xl py-3 px-6 hover:bg-red-50 transition-colors"
          >
            ✕  STOP ALARM & DISMISS
          </button>
        </motion.div>
      )}

      {/* SOS Assignment Banner for approved volunteers */}
      {sosAssignmentBanner && (
        <div className="fixed top-36 left-0 right-0 z-[8999] mx-auto max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-600 text-white rounded-xl px-5 py-4 shadow-2xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">📢</span>
              <div>
                <p className="font-extrabold text-sm uppercase tracking-wide">SOS ASSIGNMENT</p>
                <p className="text-sm">
                  You have been assigned to an SOS emergency at <span className="font-bold">{sosAssignmentBanner.address}</span>. Respond immediately!
                </p>
              </div>
            </div>
            <button
              onClick={() => { clearTimeout(sosAssignmentBannerTimerRef.current); setSosAssignmentBanner(null); }}
              className="text-white hover:text-orange-200 font-bold text-lg shrink-0"
              aria-label="Dismiss"
            >✕</button>
          </motion.div>
        </div>
      )}

      {/* Profile Card - visible to all users */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-white dark:bg-navy-light rounded-xl shadow p-6 mb-6">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-primary text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              {user?.name?.charAt(0)}
            </div>
            <h2 className="font-bold text-lg text-navy dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wide">
              {user?.role}
            </span>
          </div>

          {profileEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-navy text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                  maxLength={50}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="flex-1 min-h-[36px] bg-primary text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {profileSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setProfileEditing(false);
                    setProfileForm({ name: user?.name || '' });
                  }}
                  className="flex-1 min-h-[36px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setProfileForm({ name: user?.name || '' });
                setProfileEditing(true);
              }}
              className="w-full min-h-[36px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg px-3 py-2 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-none whitespace-nowrap">
          {allTabs.map(tab => (
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
                      <option value="not_available" className="bg-white text-gray-900 dark:bg-navy dark:text-white">Not Available</option>
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
                      {tasks.filter(t => t.status !== 'completed').length || 0}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 4: TASKS */}
        {activeTab === 'tasks' && (
          <div>
            <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Assigned Tasks</h2>
            {tasksLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">No Tasks Assigned Yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Tasks assigned by admin will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-navy border border-gray-200 dark:border-gray-700 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-navy dark:text-white truncate">{task.title}</h3>
                        {task.incidentId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Incident: <span className="font-semibold">{task.incidentId.title}</span>
                            {task.incidentId.type && ` · ${task.incidentId.type}`}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${taskStatusBadge[task.status] || ''}`}>
                        {task.status?.replace('-', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Assigned {new Date(task.createdAt).toLocaleDateString()}
                        {task.assignedBy?.name && ` by ${task.assignedBy.name}`}
                      </p>
                      <div className="flex gap-2">
                        {task.status === 'assigned' && (
                          <button
                            onClick={() => handleTaskStatusChange(task._id, 'in-progress')}
                            className="px-3 py-1.5 text-xs font-bold bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleTaskStatusChange(task._id, 'completed')}
                            className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                        {task.status === 'completed' && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-bold">✔ Done</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SETTINGS */}
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
