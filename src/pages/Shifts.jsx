import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY = { name: '', start_time: '', end_time: '', late_tolerance: 15, description: '' };

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchShifts(); }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shifts');
      setShifts(res.data.data || res.data || []);
    } catch {}
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };

  const openEdit = (s) => {
    setForm({ name: s.name, start_time: s.start_time, end_time: s.end_time, late_tolerance: s.late_tolerance || 15, description: s.description || '' });
    setEditId(s.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      setShifts(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/shifts/${editId}`, form);
        setShifts(prev => prev.map(s => s.id === editId ? (res.data.data || res.data) : s));
      } else {
        const res = await api.post('/shifts', form);
        setShifts(prev => [...prev, res.data.data || res.data]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
        <button onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 shadow">
          + Add Shift
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              No shifts found.
            </div>
          ) : shifts.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">{s.name}</h3>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start</span>
                  <span className="font-medium">{s.start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End</span>
                  <span className="font-medium">{s.end_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Late tolerance</span>
                  <span className="font-medium">{s.late_tolerance || 15} min</span>
                </div>
              </div>
              {s.description && <p className="text-xs text-gray-400 mt-2">{s.description}</p>}
              <div className="mt-4 flex space-x-2">
                <button onClick={() => openEdit(s)}
                  className="flex-1 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium">
                  Edit
                </button>
                <button onClick={() => handleDelete(s.id)}
                  className="flex-1 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">{editId ? 'Edit Shift' : 'Add Shift'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required placeholder="e.g. Morning Shift"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                    required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                    required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Late Tolerance (minutes)</label>
                <input type="number" min="0" max="60" value={form.late_tolerance}
                  onChange={e => setForm(p => ({ ...p, late_tolerance: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-70">
                  {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shifts;
