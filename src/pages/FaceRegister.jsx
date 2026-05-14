import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import api from '../api/axios';

const FaceRegister = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async (descriptor) => {
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/face/register', { descriptor });
      setStatus({ type: 'success', message: 'Face registered successfully! You can now use face check-in.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Registration failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Face Registration</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Register your face for biometric attendance. Position your face clearly in the camera frame.
        </p>
      </div>

      {status && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border ${
          status.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {status.message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          <strong>Tips:</strong> Ensure good lighting, face the camera directly, and remove glasses if possible.
        </div>
        <WebcamCapture onCapture={handleCapture} buttonLabel="Capture & Register Face" />
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Registering face data…</span>
        </div>
      )}
    </div>
  );
};

export default FaceRegister;
