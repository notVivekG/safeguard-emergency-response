import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import PageWrapper from '../components/PageWrapper';
import Toast from '../components/Toast';

// ── Shared table styles ────────────────────────────────────────────
const thCls = 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider';
const tdCls = 'px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap';

const severityColor = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
const statusColor   = { active: 'bg-red-100 text-red-700', investigating: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700' };

// ── Overview ───────────────────────────────────────────────────────
const OverviewTab = ({ statsLoading, stats }) => (
  <div>
    <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Overview Dashboard</h2>
    {statsLoading ? (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((card) => (
          <div key={card} className="h-36 rounded-xl bg-gray-200 animate-pulse dark:bg-gray-700" />
        ))}
      </div>
    ) : (
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="show"
      >
        {[
          { label: 'Total Incidents', value: stats?.totalIncidents, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-400' },
          { label: 'Active Incidents', value: stats?.activeIncidents, bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-400' },
          { label: 'Resolved', value: stats?.resolvedIncidents, bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-400' },
          { label: 'Total Users', value: stats?.totalUsers, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-400' },
          { label: 'Active Volunteers', value: stats?.activeVolunteers, bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-400' }
        ].map(({ label, value, bg, border, text }) => (
          <motion.div
            key={label}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className={`${bg} rounded-xl border p-6 ${border}`}
          >
            <p className={`${text} mb-2 font-bold`}>{label}</p>
            <p className="text-4xl font-bold text-navy dark:text-white">{value ?? '—'}</p>
          </motion.div>
        ))}
      </motion.div>
    )}
  </div>
);

// ── Incidents Tab ─────────────────────────────────────────────────
const IncidentsTab = () => {
  const { socket } = useContext(SocketContext);
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '' });
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    api.get('/incidents').then(res => {
      setIncidents(res.data?.incidents || res.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // FIX 5: Socket listener for task status updates
  useEffect(() => {
    if (!socket) return;

    const handleTaskStatusUpdated = ({ taskId, volunteerName, newStatus }) => {
      setIncidents(prev => prev.map(inc => {
        if (!inc.tasks) return inc;
        return {
          ...inc,
          tasks: inc.tasks.map(task => 
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        };
      }));

      if (newStatus === 'completed') {
        setToast({ show: true, message: `${volunteerName} has completed their task.`, type: 'success' });
      }
    };

    socket.on('task:statusUpdated', handleTaskStatusUpdated);

    return () => {
      socket.off('task:statusUpdated', handleTaskStatusUpdated);
    };
  }, [socket]);

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await api.put(`/incidents/${id}`, { status });
      setIncidents(prev => prev.map(i => i._id === id ? { ...i, status: data.status } : i));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this incident?')) return;
    try {
      await api.delete(`/incidents/${id}`);
      setIncidents(prev => prev.filter(i => i._id !== id));
    } catch (e) { console.error(e); }
  };

  const handleResolveIncident = async (id) => {
    try {
      await api.put(`/incidents/${id}`, { status: 'resolved' });
      setIncidents(prev => prev.map(i => i._id === id ? { ...i, status: 'resolved' } : i));
      setToast({ show: true, message: 'Incident marked as resolved.', type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ show: true, message: 'Failed to resolve incident.', type: 'error' });
    }
  };

  const allTasksCompleted = (incident) => {
    if (!incident.tasks || incident.tasks.length === 0) return false;
    return incident.tasks.every(task => task.status === 'completed');
  };

  const openAssignModal = async (incident) => {
    setSelectedIncident(incident);
    setTaskForm({ title: '', description: '' });
    setSelectedVolunteers([]);
    setShowAssignModal(true);
    setVolunteersLoading(true);
    try {
      const res = await api.get('/admin/volunteers?availableOnly=true');
      setVolunteers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!taskForm.title || selectedVolunteers.length === 0) return;
    setSubmitting(true);
    try {
      const res = await api.post('/admin/tasks', {
        title: taskForm.title,
        description: taskForm.description,
        incidentId: selectedIncident._id,
        assignedTo: selectedVolunteers
      });
      // FIX: Populate assignedTo with full volunteer objects to show names immediately
      const populatedAssignedTo = selectedVolunteers.map(id => {
        const match = volunteers.find(v => (v.user?._id ?? v.user) === id || v._id === id);
        return match?.user ?? match ?? { _id: id, name: 'Volunteer', email: '' };
      });
      const populatedTask = {
        ...res.data,
        assignedTo: populatedAssignedTo
      };
      setIncidents(prev =>
        prev.map(inc =>
          inc._id === selectedIncident._id
            ? {
                ...inc,
                tasks: [...(inc.tasks || []), populatedTask]
              }
            : inc
        )
      );
      setToast({ show: true, message: `Task assigned to ${selectedVolunteers.length} volunteer(s)`, type: 'success' });
      setShowAssignModal(false);
    } catch (e) {
      setToast({ show: true, message: e.response?.data?.message || 'Failed to assign task', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVolunteer = (volunteerId) => {
    setSelectedVolunteers(prev => 
      prev.includes(volunteerId) 
        ? prev.filter(id => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const filtered = incidents.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-navy dark:text-white">Incidents</h2>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-navy dark:text-white md:w-64"
        />
      </div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-navy">
              <tr>
                {['Title', 'Type', 'Severity', 'Status', 'Location', 'Reported By', 'Assigned Volunteers', 'Date', 'Actions'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-light divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No incidents found</td></tr>
              ) : filtered.map(inc => (
                <tr key={inc._id} className="hover:bg-gray-50 dark:hover:bg-navy transition-colors">
                  <td className={`${tdCls} max-w-[160px] truncate font-medium`}>{inc.title}</td>
                  <td className={tdCls}><span className="capitalize">{inc.type}</span></td>
                  <td className={tdCls}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${severityColor[inc.severity]}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className={tdCls}>
                    <select
                      value={inc.status}
                      onChange={e => handleStatusChange(inc._id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded border-0 outline-none cursor-pointer ${statusColor[inc.status]}`}
                    >
                      <option value="active">Active</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className={`${tdCls} max-w-[140px] truncate text-gray-400`}>{inc.address || '—'}</td>
                  <td className={tdCls}>{inc.reportedBy?.name || '—'}</td>
                  <td className={tdCls}>
                    {inc.tasks && inc.tasks.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {inc.tasks.map(task => (
                          <div key={task._id} className="text-xs">
                            {task.assignedTo && task.assignedTo.length > 0 ? (
                              task.assignedTo.map(volunteer => {
                                const name = typeof volunteer === 'string' ? 'Volunteer' : (volunteer?.name ?? volunteer?.user?.name ?? volunteer?.email ?? 'Volunteer');
                                return (
                                  <div key={typeof volunteer === 'string' ? volunteer : volunteer._id} className="flex items-center gap-1 mb-1">
                                    <span className="font-medium">{name}</span>
                                    <span className="text-gray-400">—</span>
                                    <span className="text-gray-600 dark:text-gray-300">{task.title}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                      task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                    }`}>
                                      {task.status === 'completed' ? '✓ Completed' : task.status === 'in-progress' ? 'In Progress' : 'Assigned'}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-gray-400">No volunteers assigned</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None assigned</span>
                    )}
                  </td>
                  <td className={tdCls}>{new Date(inc.createdAt).toLocaleDateString()}</td>
                  <td className={tdCls}>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openAssignModal(inc)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs font-bold transition-colors"
                      >
                        Assign Volunteers
                      </button>
                      {allTasksCompleted(inc) && inc.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveIncident(inc._id)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 text-xs font-bold transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inc._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Volunteers Modal */}
      {showAssignModal && selectedIncident && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-navy dark:text-white mb-1">{selectedIncident.title}</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded capitalize">
                    {selectedIncident.type}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${severityColor[selectedIncident.severity]}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                <input
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full h-11 px-3 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Task Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows={3}
                  className="w-full p-3 bg-gray-50 dark:bg-navy border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Volunteers</label>
                {volunteersLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : volunteers.length === 0 ? (
                  <p className="text-sm text-gray-500">No volunteers are currently available. Volunteers must be approved and set to Available.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {volunteers.map(v => (
                      <label
                        key={v._id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedVolunteers.includes(v.user?._id)
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-navy border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedVolunteers.includes(v.user?._id)}
                          onChange={() => toggleVolunteer(v.user?._id)}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-navy dark:text-white text-sm">{v.user?.name || '—'}</p>
                          <div className="flex gap-1 mt-1">
                            {v.skills?.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded">
                          Available
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAssignTask}
                disabled={!taskForm.title || selectedVolunteers.length === 0 || submitting}
                className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Assigning...' : 'Assign Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Users Tab ─────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(res => {
      setUsers(res.data?.users || res.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: data.role } : u));
    } catch (e) { console.error(e); }
  };

  const roleColor = { admin: 'text-red-600', volunteer: 'text-blue-600', user: 'text-gray-600' };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">Users</h2>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-navy">
              <tr>
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-light divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-navy transition-colors">
                  <td className={`${tdCls} font-medium`}>{u.name}</td>
                  <td className={tdCls}>{u.email}</td>
                  <td className={tdCls}>
                    <span className={`font-bold capitalize text-xs ${roleColor[u.role]}`}>{u.role}</span>
                  </td>
                  <td className={tdCls}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className={tdCls}>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u._id, e.target.value)}
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-navy dark:text-white outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="user">User</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Broadcast Tab ─────────────────────────────────────────────────
const BroadcastTab = () => {
  const [form, setForm] = useState({ title: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchBroadcasts = async () => {
    try {
      const { data } = await api.get('/notifications/broadcasts');
      setBroadcasts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) return alert('Please fill title and message');
    setSending(true);
    try {
      await api.post('/admin/broadcast', form);
      setSuccess(true);
      setForm({ title: '', message: '' });
      await fetchBroadcasts();
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('Delete this broadcast?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setBroadcasts(prev => prev.filter(item => item._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete broadcast');
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Broadcast Notification</h2>
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center gap-2"
        >
          <span className="text-xl">✅</span> Notification sent to all users successfully!
        </motion.div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Emergency Alert"
            className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-navy dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
          <textarea
            rows={5}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Write your broadcast message here..."
            className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-primary resize-none dark:border-gray-600 dark:bg-navy dark:text-white"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
        >
          {sending ? 'Sending...' : '📢 Send Notification to All Users'}
        </button>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-bold text-navy dark:text-white mb-3">Broadcast History</h3>
        {loadingHistory ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700" />
            ))}
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-sm text-gray-400">No broadcasts yet.</div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map(item => (
              <div
                key={item._id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-navy"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">{item.body}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBroadcast(item._id)}
                    className="min-h-[44px] shrink-0 rounded bg-red-100 px-3 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Export Tab ────────────────────────────────────────────────────
const ExportTab = () => {
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/incidents').finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/incidents');
      const incidents = res.data?.incidents || res.data || [];

      const headers = ['Title', 'Type', 'Severity', 'Status', 'Address', 'Date'];
      const rows = incidents.map(i => [
        `"${(i.title || '').replace(/"/g, '""')}"`,
        i.type,
        i.severity,
        i.status,
        `"${(i.address || '').replace(/"/g, '""')}"`,
        new Date(i.createdAt).toLocaleDateString()
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safeguard-incidents-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Export Data</h2>
      {loading ? (
        <div className="h-48 rounded-xl bg-gray-200 animate-pulse dark:bg-gray-700" />
      ) : (
      <div className="bg-gray-50 dark:bg-navy p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="font-bold text-lg text-navy dark:text-white mb-2">Incidents Report</h3>
        <p className="text-sm text-gray-500 mb-6">Download all incidents as a CSV file with title, type, severity, status, location, and date.</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-navy py-3 font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-70"
        >
          {exporting ? 'Generating...' : '⬇️ Download Incidents CSV'}
        </button>
      </div>
      )}
    </div>
  );
};

// ── Volunteers Tab ────────────────────────────────────────────────
const VolunteersTab = () => {
  const { socket } = useContext(SocketContext);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    api.get('/admin/volunteers')
      .then(res => {
        setVolunteers(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Socket listener for availability updates
  useEffect(() => {
    if (!socket) return;

    const handleAvailabilityUpdated = ({ volunteerId, isAvailable, currentStatus }) => {
      setVolunteers(prev => prev.map(v => v._id === volunteerId ? { ...v, availability: isAvailable, activityStatus: currentStatus } : v));
    };

    socket.on('volunteer:availabilityUpdated', handleAvailabilityUpdated);

    return () => {
      socket.off('volunteer:availabilityUpdated', handleAvailabilityUpdated);
    };
  }, [socket]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/volunteers/${id}/approve`);
      setVolunteers(prev => prev.map(v => v._id === id ? { ...v, status: 'approved' } : v));
      setToast({ show: true, message: 'Volunteer approved successfully!', type: 'success' });
    } catch (e) {
      setToast({ show: true, message: e.response?.data?.message || 'Approval failed', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/admin/volunteers/${id}/reject`);
      setVolunteers(prev => prev.map(v => v._id === id ? { ...v, status: 'rejected' } : v));
      setToast({ show: true, message: 'Volunteer application rejected.', type: 'success' });
    } catch (e) {
      setToast({ show: true, message: e.response?.data?.message || 'Rejection failed', type: 'error' });
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-850 dark:bg-yellow-950/20 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-850 dark:bg-green-950/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-850 dark:bg-red-950/20 dark:text-red-400'
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">Volunteer Applications</h2>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-navy">
              <tr>
                {['Name', 'Email', 'Skills', 'Availability', 'Current Status', 'Status', 'Actions'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-light divide-y divide-gray-100 dark:divide-gray-800">
              {volunteers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No volunteer applications found</td></tr>
              ) : volunteers.map(v => (
                <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-navy transition-colors">
                  <td className={`${tdCls} font-medium`}>{v.user?.name || '—'}</td>
                  <td className={tdCls}>{v.user?.email || '—'}</td>
                  <td className={tdCls}>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {v.skills && v.skills.length > 0 ? v.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-navy text-gray-800 dark:text-gray-200 text-xs rounded font-semibold">
                          {s}
                        </span>
                      )) : '—'}
                    </div>
                  </td>
                  <td className={tdCls}>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${v.availability ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'}`}>
                      {v.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className={tdCls}>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      v.activityStatus === 'not_available' 
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400' 
                        : v.activityStatus === 'available'
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                          : v.activityStatus === 'en-route'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                            : v.activityStatus === 'on-site'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
                    }`}>
                      {v.activityStatus?.replace('-', ' ') || 'Available'}
                    </span>
                  </td>
                  <td className={tdCls}>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${statusColors[v.status] || 'bg-gray-100 text-gray-850'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className={tdCls}>
                    {v.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(v._id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(v._id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 capitalize">{v.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── SOS Alerts Tab ─────────────────────────────────────────────────
const SOSAlertsTab = () => {
  const { socket } = useContext(SocketContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    api.get('/sos')
      .then(res => {
        setAlerts(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Socket listener for new SOS alerts
  useEffect(() => {
    if (!socket) return;

    const handleSosAlert = (payload) => {
      setAlerts(prev => [payload, ...prev]);
      setHasUnread(true);
      // Play beep sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        console.error('Audio play failed:', e);
      }
    };

    socket.on('sos:alert', handleSosAlert);

    return () => {
      socket.off('sos:alert', handleSosAlert);
    };
  }, [socket]);

  const handleResolve = async (id) => {
    try {
      await api.patch(`/sos/${id}/resolve`);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, status: 'resolved' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const openAssignModal = async (alert) => {
    setSelectedAlert(alert);
    setSelectedVolunteers(alert.assignedVolunteers?.map(v => v._id) || []);
    setShowAssignModal(true);
    setVolunteersLoading(true);
    try {
      const res = await api.get('/admin/volunteers');
      setVolunteers(res.data.filter(v => v.status === 'approved' && v.availability));
    } catch (e) {
      console.error(e);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const handleAssignVolunteers = async () => {
    if (selectedVolunteers.length === 0) return;
    setAssigning(true);
    try {
      const res = await api.patch(`/sos/${selectedAlert._id}/assign`, { volunteerIds: selectedVolunteers });
      setAlerts(prev => prev.map(a => a._id === selectedAlert._id ? res.data : a));
      setToast({ show: true, message: `Volunteer(s) assigned to SOS alert`, type: 'success' });
      setShowAssignModal(false);
    } catch (e) {
      setToast({ show: true, message: e.response?.data?.message || 'Failed to assign volunteers', type: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  const toggleVolunteer = (volunteerId) => {
    setSelectedVolunteers(prev => 
      prev.includes(volunteerId) 
        ? prev.filter(id => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const sosStatusColor = {
    active: 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">SOS Alerts</h2>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚨</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">No SOS Alerts</h3>
          <p className="text-gray-500">Emergency SOS alerts will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-navy">
              <tr>
                {['Name', 'Address', 'Time', 'Status', 'Assigned Volunteers', 'Action'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-light divide-y divide-gray-100 dark:divide-gray-800">
              {alerts.map(alert => (
                <tr key={alert._id} className="hover:bg-gray-50 dark:hover:bg-navy transition-colors">
                  <td className={`${tdCls} font-medium`}>{alert.userName || '—'}</td>
                  <td className={`${tdCls} max-w-[200px] truncate`}>{alert.address || '—'}</td>
                  <td className={tdCls}>{new Date(alert.createdAt).toLocaleString()}</td>
                  <td className={tdCls}>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${sosStatusColor[alert.status] || 'bg-gray-100 text-gray-850'}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className={tdCls}>
                    {(alert.assignedVolunteers ?? []).length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {alert.assignedVolunteers
                          .filter(v => v !== null && v !== undefined)
                          .map(v => (
                            <span key={v._id} className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded">
                              {v?.name ?? v?.user?.name ?? 'Unknown Volunteer'}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className={tdCls}>
                    <div className="flex gap-2">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => openAssignModal(alert)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-bold transition-colors"
                        >
                          Assign Volunteer
                        </button>
                      )}
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleResolve(alert._id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {alert.status === 'resolved' && (
                        <span className="text-xs text-gray-400">Resolved</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Volunteers Modal */}
      {showAssignModal && selectedAlert && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/70 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-navy dark:text-white mb-1">Assign Volunteers to SOS</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAlert.address}</p>
                <p className="text-xs text-gray-400">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Volunteers</label>
              {volunteersLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : volunteers.length === 0 ? (
                <p className="text-sm text-gray-500">No approved and available volunteers found.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {volunteers.map(v => (
                    <label
                      key={v._id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedVolunteers.includes(v.user?._id)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-navy border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVolunteers.includes(v.user?._id)}
                        onChange={() => toggleVolunteer(v.user?._id)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-navy dark:text-white text-sm">{v.user?.name || '—'}</p>
                        <div className="flex gap-1 mt-1">
                          {v.skills?.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded">
                        Available
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAssignVolunteers}
              disabled={selectedVolunteers.length === 0 || assigning}
              className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {assigning ? 'Assigning...' : 'Assign Volunteer(s)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Admin Page ───────────────────────────────────────────────
const Admin = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => { document.title = 'Admin Panel — SafeGuard'; }, []);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const tabs = [
    { id: 'overview',   icon: '📊', label: 'Overview' },
    { id: 'incidents',  icon: '🚨', label: 'Incidents' },
    { id: 'users',      icon: '👥', label: 'Users' },
    { id: 'volunteers', icon: '🤝', label: 'Volunteers' },
    { id: 'sos-alerts', icon: '🆘', label: 'SOS Alerts' },
    { id: 'broadcast',  icon: '📢', label: 'Broadcast' },
    { id: 'export',     icon: '⬇️', label: 'Export' },
  ];

  return (
    <PageWrapper className="flex min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Mobile toggle button */}
      <button
        className="md:hidden absolute top-4 left-4 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-primary text-white shadow-lg"
        onClick={() => setShowSidebar(!showSidebar)}
        aria-label="Toggle sidebar"
      >
        {showSidebar ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-56 bg-navy text-white rounded-xl shadow-lg p-4 flex flex-col shrink-0`}>
        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 px-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Admin Panel
        </h2>
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowSidebar(false);
              }}
              className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-navy-light rounded-xl shadow p-6 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'incidents' && <IncidentsTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'volunteers' && <VolunteersTab />}
          {activeTab === 'sos-alerts' && <SOSAlertsTab />}
          {activeTab === 'broadcast' && <BroadcastTab />}
          {activeTab === 'export' && <ExportTab />}
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Admin;
