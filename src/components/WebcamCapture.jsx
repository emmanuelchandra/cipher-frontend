import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

const WebcamCapture = ({ onCapture, buttonLabel }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [modelError, setModelError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        setModelError('Could not load face detection models. Ensure /public/models contains the required weight files.');
      }
    };
    load();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const runDetection = useCallback(async () => {
    if (!webcamRef.current?.video || !canvasRef.current || !modelsLoaded) return;
    const video = webcamRef.current.video;
    // Wait until video is fully playing AND has real dimensions
    if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) return;

    try {
      // Detection-only (no landmarks) — avoids the Box.constructor null error
      // that face-api.js throws internally when landmarks run on partial frames.
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }));

      // Re-check after await — canvas/video may be gone or dimensions reset
      if (!canvasRef.current) return;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const valid = detections.filter(d => {
        const b = d.box;
        return b && b.x != null && b.y != null && b.width != null && b.height != null;
      });

      const dims = { width: video.videoWidth, height: video.videoHeight };
      const canvas = canvasRef.current;
      faceapi.matchDimensions(canvas, dims);
      const resized = faceapi.resizeResults(valid, dims);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      setFaceDetected(valid.length === 1);
    } catch {
      // Silently ignore transient errors
    }
  }, [modelsLoaded]);

  useEffect(() => {
    if (modelsLoaded) {
      intervalRef.current = setInterval(runDetection, 250);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [modelsLoaded, runDetection]);

  const handleCapture = async () => {
    if (!webcamRef.current?.video || !faceDetected) return;
    const video = webcamRef.current.video;
    if (video.readyState !== 4 || video.videoWidth === 0) return;
    setCapturing(true);
    try {
      const result = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result) {
        alert('No face detected. Please position your face in the frame and try again.');
        setCapturing(false);
        return;
      }
      onCapture(Array.from(result.descriptor));
    } catch {
      alert('Face capture failed. Please try again.');
    }
    setCapturing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {modelError && (
        <div className="w-full bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          {modelError}
        </div>
      )}

      {!modelsLoaded && !modelError && (
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading face detection models…</span>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white"
        style={{ width: 480, height: 360 }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          width={480}
          height={360}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 480, height: 360, facingMode: 'user' }}
          className="rounded-2xl"
        />
        <canvas ref={canvasRef} width={480} height={360}
          className="absolute inset-0" />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow ${
          faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {faceDetected ? '✓ Face Detected' : '✗ No Face'}
        </div>
      </div>

      <button
        onClick={handleCapture}
        disabled={!modelsLoaded || !faceDetected || capturing}
        className={`px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-md ${
          modelsLoaded && faceDetected && !capturing
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {capturing ? 'Processing…' : buttonLabel || 'Capture Face'}
      </button>
    </div>
  );
};

export default WebcamCapture;
