import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import WebcamCapture from '../components/WebcamCapture';
import AttendanceCard from '../components/AttendanceCard';
import api from '../api/axios';

const Attendance = () => {
  const [mode, setMode] = useState('check-in');
  const [status, setStatus] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Animation refs
  const alertRef    = useRef(null);
  const checkRef    = useRef(null);
  const msgRef      = useRef(null);
  const recordsRef  = useRef(null);

  useEffect(() => { fetchRecords(); }, []);

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

  // Alert slide-in + success timeline
  useEffect(() => {
    if (!status || !alertRef.current) return;

    // Slide alert down with bounce
    anime({
      targets: alertRef.current,
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutBack',
    });

    if (status.type === 'success' && checkRef.current && msgRef.current) {
      // Reset initial states so animation re-triggers cleanly
      anime.set(checkRef.current, { scale: 0 });
      anime.set(msgRef.current,   { translateY: 20, opacity: 0 });

      anime.timeline({ easing: 'easeOutExpo' })
        .add({
          targets: checkRef.current,
          scale: [0, 1.2],
          duration: 380,
          easing: 'easeOutBack',
        })
        .add({
          targets: checkRef.current,
          scale: 1,
          duration: 180,
        })
        .add({
          targets: msgRef.current,
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 380,
        }, '-=100')
        .add({
          // Pulse the record cards if they exist
          targets: recordsRef.current ? Array.from(recordsRef.current.children) : [],
          scale: [1, 1.03, 1],
          duration: 400,
          delay: anime.stagger(60),
          easing: 'easeInOutQuad',
        }, '-=200');
    }
  }, [status]);

  // Stagger attendance cards when records change
  useEffect(() => {
    if (!recordsRef.current || records.length === 0) return;
    // Small delay so React has painted the new children
    const id = setTimeout(() => {
      anime({
        targets: Array.from(recordsRef.current?.children ?? []),
        translateX: [-30, 0],
        opacity:    [0, 1],
        duration:   500,
        delay:      anime.stagger(80),
        easing:     'easeOutQuad',
      });
    }, 30);
    return () => clearTimeout(id);
  }, [records]);

  // Dismiss alert with slide-up fade-out
  const handleDismiss = () => {
    if (!alertRef.current) { setStatus(null); return; }
    anime({
      targets: alertRef.current,
      translateY: -20,
      opacity: 0,
      duration: 300,
      easing: 'easeInQuad',
      complete: () => setStatus(null),
    });
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
          <div
            ref={alertRef}
            style={{ opacity: 0 }}
            className={`mb-5 rounded-xl border overflow-hidden ${
              status.type === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {status.type === 'success' ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <span
                  ref={checkRef}
                  style={{ display: 'inline-block', transform: 'scale(0)' }}
                  className="text-2xl flex-shrink-0"
                >
                  ✅
                </span>
                <span
                  ref={msgRef}
                  style={{ opacity: 0 }}
                  className="text-sm font-medium text-green-700"
                >
                  {status.message}
                </span>
                <button onClick={handleDismiss} className="ml-auto text-green-400 hover:text-green-600 text-lg leading-none">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <span className="text-sm font-medium text-red-700 flex-1">{status.message}</span>
                <button onClick={handleDismiss} className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>
              </div>
            )}
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
          <div ref={recordsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {records.map((r) => <AttendanceCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
