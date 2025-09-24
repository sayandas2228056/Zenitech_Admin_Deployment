import React, { useEffect, useState } from 'react';

const Settings = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);

  const api = import.meta.env.VITE_ADMIN_API;

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${api}/api/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setInfo(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const sendTestEmail = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${api}/api/settings/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ to })
      });
      if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.message || 'Failed to send test email');
      }
      alert('Test email sent');
    } catch (e) { alert(e.message); } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Environment</h2>
              <div className="text-sm text-gray-700">SMTP Configured: <span className={`font-medium ${info?.env?.hasEmailCreds ? 'text-green-700' : 'text-red-700'}`}>{info?.env?.hasEmailCreds ? 'Yes' : 'No'}</span></div>
              <div className="text-sm text-gray-700 mt-1">Frontend URLs:</div>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {(info?.env?.frontendUrls || []).map((u, i) => (<li key={i}>{u}</li>))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Send Test Email</h2>
              <form onSubmit={sendTestEmail} className="flex gap-2">
                <input className="border rounded px-3 py-2 flex-1" placeholder="Recipient email" value={to} onChange={e=>setTo(e.target.value)} />
                <button disabled={sending} className={`px-4 py-2 rounded text-white ${sending?'bg-gray-400':'bg-orange-600 hover:bg-orange-700'}`}>{sending?'Sending...':'Send'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
