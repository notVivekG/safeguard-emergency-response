import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

// ── Shared table styles ────────────────────────────────────────────
const thCls = 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider';
const tdCls = 'px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap';

const severityColor = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
const statusColor   = { active: 'bg-red-100 text-red-700', investigating: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700' };

// ── Overview ───────────────────────────────────────────────────────
const OverviewTab = ({ stats }) => (
  <div>
    <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Overview Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { label: 'Total Incidents',    value: stats?.totalIncidents,    bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800',     text: 'text-red-800 dark:text-red-400' },
        { label: 'Active Incidents',   value: stats?.activeIncidents,   bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-400' },
        { label: 'Resolved',           value: stats?.resolvedIncidents, bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',   text: 'text-green-800 dark:text-green-400' },
        { label: 'Total Users',        value: stats?.totalUsers,        bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',     text: 'text-blue-800 dark:text-blue-400' },
        { label: 'Active Volunteers',  value: stats?.activeVolunteers,  bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-400' },
      ].map(({ label, value, bg, border, text }) => (
        <div key={label} className={`${bg} p-6 rounded-xl border ${border}`}>
          <p className={`${text} font-bold mb-2`}>{label}</p>
          <p className="text-4xl font-bold text-navy dark:text-white">{value ?? '—'}</p>
        </div>
      ))}
    </div>
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
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-navy dark:text-white outline-none focus:ring-2 focus:ring-primary w-64"
        />
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading incidents...</div>
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
        <div className="text-center py-12 text-gray-400">Loading users...</div>
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

  const handleSend = async () => {
    if (!form.title || !form.message) return alert('Please fill title and message');
    setSending(true);
    try {
      await api.post('/admin/broadcast', form);
      setSuccess(true);
      setForm({ title: '', message: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy dark:text-white outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
          <textarea
            rows={5}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Write your broadcast message here..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {sending ? 'Sending...' : '📢 Send Notification to All Users'}
        </button>
      </div>
    </div>
  );
};

// ── Export Tab ────────────────────────────────────────────────────
const ExportTab = () => {
  const [exporting, setExporting] = useState(false);

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
      <div className="bg-gray-50 dark:bg-navy p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="font-bold text-lg text-navy dark:text-white mb-2">Incidents Report</h3>
        <p className="text-sm text-gray-500 mb-6">Download all incidents as a CSV file with title, type, severity, status, location, and date.</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-3 bg-navy hover:bg-gray-800 text-white font-bold rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {exporting ? 'Generating...' : '⬇️ Download Incidents CSV'}
        </button>
      </div>
    </div>
  );
};

// ── Main Admin Page ───────────────────────────────────────────────
const Admin = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const tabs = [
    { id: 'overview',  icon: '📊', label: 'Overview' },
    { id: 'incidents', icon: '🚨', label: 'Incidents' },
    { id: 'users',     icon: '👥', label: 'Users' },
    { id: 'broadcast', icon: '📢', label: 'Broadcast' },
    { id: 'export',    icon: '⬇️', label: 'Export' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 bg-navy text-white rounded-xl shadow-lg p-4 flex flex-col shrink-0">
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
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
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
          {activeTab === 'overview'  && <OverviewTab stats={stats} />}
          {activeTab === 'incidents' && <IncidentsTab />}
          {activeTab === 'users'     && <UsersTab />}
          {activeTab === 'broadcast' && <BroadcastTab />}
          {activeTab === 'export'    && <ExportTab />}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
