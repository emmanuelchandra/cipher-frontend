import React, { useState, useEffect } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import AttendanceCard from '../components/AttendanceCard';
import api from '../api/axios';

const Attendance = () => {
  const [mode, setMode] = useState('check-in');
  const [status, setStatus] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await api.get('/attendance/today');
      setRecords(res.data.data || res.data || []);
    } catch {
      setRecords([]);
    }
    setLoadingRecords(false);
  };

  const handleCapture = async (descriptor) => {
    setStatus(null);
    try {
      const endpoint = mode === 'check-in' ? '/face/check-in' : '/face/check-out';
      const res = await api.post(endpoint, { descriptor });
      setStatus({ type: 'success', message: res.data.message || `${mode === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully!` });
      fetchRecords();
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed. Please try again.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex space-x-2 mb-6">
          {['check-in', 'check-out'].map((m) => (
            <button key={m}
              onClick={() => { setMode(m); setStatus(null); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm capitalize transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {m.replace('-', ' ')}
            </button>
          ))}
        </div>

        {status && (
          <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium border ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status.message}
          </div>
        )}

        <WebcamCapture
          onCapture={handleCapture}
          buttonLabel={mode === 'check-in' ? 'Check In' : 'Check Out'}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Today's Records</h2>
        {loadingRecords ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            No attendance records for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {records.map((r) => <AttendanceCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
