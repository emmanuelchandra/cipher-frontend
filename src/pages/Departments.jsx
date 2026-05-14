import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || res.data || []);
    } catch {}
    setLoading(false);
  };

  const openCreate = () => { setForm({ name: '', description: '' }); setEditId(null); setShowModal(true); };

  const openEdit = (d) => { setForm({ name: d.name, description: d.description || '' }); setEditId(d.id); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/departments/${editId}`, form);
        setDepartments(prev => prev.map(d => d.id === editId ? (res.data.data || res.data) : d));
      } else {
        const res = await api.post('/departments', form);
        setDepartments(prev => [...prev, res.data.data || res.data]);
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
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <button onClick={openCreate}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 shadow">
          + Add Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {departments.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No departments found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">#</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Description</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Employees</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d, i) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{d.name}</td>
                    <td className="px-6 py-4 text-gray-500">{d.description || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {d.employees_count ?? d.employees?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(d)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(d.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">{editId ? 'Edit Department' : 'Add Department'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required placeholder="e.g. Engineering"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Optional description"
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

export default Departments;
