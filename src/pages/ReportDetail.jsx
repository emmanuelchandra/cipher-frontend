import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending:  'bg-orange-100 text-orange-700 border-orange-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const ReportDetail = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(r => setReport(r.data.data || r.data))
      .catch(() => navigate('/reports'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/reports/${id}/approve`, { note });
      setReport(res.data.data || res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Approve failed.');
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!note.trim()) { alert('Please provide a rejection note.'); return; }
    setActionLoading(true);
    try {
      const res = await api.post(`/reports/${id}/reject`, { note });
      setReport(res.data.data || res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Reject failed.');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate('/reports')}
          className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Report Detail</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Submitted by</p>
            <p className="text-lg font-semibold text-gray-800">{report.employee?.name}</p>
            <p className="text-sm text-gray-500">{report.employee?.department?.name}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize border ${statusColors[report.status] || 'bg-gray-100 text-gray-600'}`}>
            {report.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Type</p>
            <p className="font-medium text-gray-800 capitalize">{report.type}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Date</p>
            <p className="font-medium text-gray-800">{report.date || report.created_at?.slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Submitted</p>
            <p className="font-medium text-gray-800">{report.created_at?.slice(0, 10)}</p>
          </div>
          {report.approved_by && (
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Reviewed by</p>
              <p className="font-medium text-gray-800">{report.approved_by?.name}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">Reason</p>
          <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed">
            {report.reason}
          </div>
        </div>

        {report.note && (
          <div>
            <p className="text-gray-400 text-xs mb-1">Reviewer Note</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-gray-700 text-sm">
              {report.note}
            </div>
          </div>
        )}

        {hasRole(['admin', 'hr']) && report.status === 'pending' && (
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional for approval, required for rejection)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                placeholder="Add a review note…"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            <div className="flex space-x-3">
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 py-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70">
                {actionLoading ? 'Processing…' : 'Reject'}
              </button>
              <button onClick={handleApprove} disabled={actionLoading}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold shadow transition-all disabled:opacity-70">
                {actionLoading ? 'Processing…' : 'Approve'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetail;
