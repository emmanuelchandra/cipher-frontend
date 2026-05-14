import React, { useEffect, useState } from 'react';
import EmployeeCard from '../components/EmployeeCard';
import api from '../api/axios';

const EMPTY_FORM = {
  name: '', email: '', password: '', department_id: '', shift_id: '', position: '', hire_date: '', role: 'employee',
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, shiftRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
        api.get('/shifts'),
      ]);
      setEmployees(empRes.data.data || empRes.data || []);
      setDepartments(deptRes.data.data || deptRes.data || []);
      setShifts(shiftRes.data.data || shiftRes.data || []);
    } catch {}
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };

  const openEdit = (emp) => {
    setForm({
      name: emp.user?.name || emp.name || '',
      email: emp.user?.email || '',
      password: '',
      department_id: emp.department_id || '',
      shift_id: emp.shift_id || '',
      position: emp.position || '',
      hire_date: emp.hire_date || '',
      role: emp.user?.role || 'employee',
    });
    setEditId(emp.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/employees/${editId}`, form);
        setEmployees(prev => prev.map(e => e.id === editId ? (res.data.data || res.data) : e));
      } else {
        const res = await api.post('/employees', form);
        setEmployees(prev => [...prev, res.data.data || res.data]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    }
    setSaving(false);
  };

  const filtered = employees.filter(e =>
    (e.user?.name || e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.position || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={openCreate}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow">
            + Add Employee
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          No employees found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(e => (
            <EmployeeCard key={e.id} employee={e} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-5">{editId ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: editId ? 'New Password (leave blank to keep)' : 'Password', key: 'password', type: 'password' },
                { label: 'Position', key: 'position', type: 'text' },
                { label: 'Hire Date', key: 'hire_date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.key !== 'password' || !editId}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                <select value={form.shift_id} onChange={e => setForm(p => ({ ...p, shift_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select shift</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
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

export default Employees;
