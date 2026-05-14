import React, { useEffect, useState } from 'react';
import ReportCard from '../components/ReportCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { hasRole } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'permission', reason: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchReports(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReports = async () => {
    setLoading(true);
    try {
      const endpoint = hasRole(['admin', 'hr']) ? '/reports/pending' : '/reports/my';
      const res = await api.get(endpoint);
      setReports(res.data.data || res.data || []);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/reports', form);
      setReports(prev => [res.data.data || res.data, ...prev]);
      setShowModal(false);
      setForm({ type: 'permission', reason: '', date: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report.');
    }
    setSaving(false);
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {hasRole(['admin', 'hr']) ? 'Pending reports awaiting approval' : 'Your submitted reports'}
          </p>
        </div>
        {hasRole('employee') && (
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 shadow">
            + Submit Report
          </button>
        )}
      </div>

      <div className="flex space-x-2">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          No reports found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(r => <ReportCard key={r.id} report={r} />)}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Submit Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="permission">Permission</option>
                  <option value="late">Late</option>
                  <option value="absence">Absence</option>
                  <option value="overtime">Overtime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                  required rows={4} placeholder="Explain the reason…"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-70">
                  {saving ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
