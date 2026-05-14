import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { removeWhiteBackground } from '../utils/removeBackground';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ company_name: '', company_address: '', company_phone: '', company_email: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const stampRef = useRef();
  const sigRef = useRef();

  useEffect(() => {
    api.get('/settings')
      .then(r => {
        const d = r.data.data || r.data;
        setSettings(d);
        setForm({
          company_name: d.company_name || '',
          company_address: d.company_address || '',
          company_phone: d.company_phone || '',
          company_email: d.company_email || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/settings', form);
      setSettings(res.data.data || res.data);
      setSuccessMsg('Settings saved successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    }
    setSaving(false);
  };

  const handleFileUpload = async (file, endpoint, setUploading) => {
    if (!file) return;
    setUploading(true);
    setSuccessMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSettings(prev => ({ ...prev, ...(res.data.data || res.data) }));
      setSuccessMsg('File uploaded successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Company Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Company Name', key: 'company_name', type: 'text' },
            { label: 'Address', key: 'company_address', type: 'text' },
            { label: 'Phone', key: 'company_phone', type: 'tel' },
            { label: 'Email', key: 'company_email', type: 'email' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-70 shadow">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Company Stamp</h2>
        {settings?.stamp_url && (
          <img src={settings.stamp_url} alt="Stamp" className="h-24 mb-4 object-contain border border-gray-200 rounded-xl p-2" />
        )}
        <input ref={stampRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFileUpload(e.target.files[0], '/settings/upload-stamp', setUploadingStamp)} />
        <button onClick={() => stampRef.current?.click()} disabled={uploadingStamp}
          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-70">
          {uploadingStamp ? 'Uploading…' : 'Upload Stamp'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-1">Signature</h2>
        <p className="text-sm text-gray-500 mb-4">
          Background putih akan otomatis dihapus agar tanda tangan tampak transparan di PDF.
        </p>
        {settings?.signature_url && (
          <div className="mb-4 inline-block border border-gray-200 rounded-xl p-3 bg-gray-50">
            <img src={settings.signature_url} alt="Signature"
              className="h-20 object-contain"
              style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 12px 12px' }} />
            <p className="text-xs text-gray-400 mt-1 text-center">Preview (kotak-kotak = transparan)</p>
          </div>
        )}
        <input ref={sigRef} type="file" accept="image/*" className="hidden"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setUploadingSig(true);
            setSuccessMsg('');
            try {
              const transparent = await removeWhiteBackground(file);
              await handleFileUpload(transparent, '/employees/upload-signature', () => {});
            } catch {
              alert('Gagal memproses gambar.');
            }
            setUploadingSig(false);
          }} />
        <button onClick={() => sigRef.current?.click()} disabled={uploadingSig}
          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-70">
          {uploadingSig ? 'Memproses…' : 'Upload Signature'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
