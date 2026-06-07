import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/incidents').then(res => {
      setIncidents(res.data?.incidents || res.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

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
                {['Title', 'Type', 'Severity', 'Status', 'Location', 'Reported By', 'Date', 'Actions'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-light divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No incidents found</td></tr>
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
                  <td className={tdCls}>{new Date(inc.createdAt).toLocaleDateString()}</td>
                  <td className={tdCls}>
                    <button
                      onClick={() => handleDelete(inc._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold transition-colors"
                    >
                      Delete
                    </button>
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
                {['Name', 'Email', 'Skills', 'Availability', 'Status', 'Actions'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-light divide-y divide-gray-100 dark:divide-gray-800">
              {volunteers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No volunteer applications found</td></tr>
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
          {activeTab === 'broadcast' && <BroadcastTab />}
          {activeTab === 'export' && <ExportTab />}
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Admin;
