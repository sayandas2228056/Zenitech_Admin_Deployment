import React, { useEffect, useState } from 'react';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'agent' });
  const [saving, setSaving] = useState(false);

  const api = import.meta.env.VITE_ADMIN_API;

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${api}/api/agents`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      setAgents(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${api}/api/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.message || 'Failed to create agent');
      }
      setForm({ name: '', email: '', role: 'agent' });
      await fetchAgents();
      alert('Agent created');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${api}/api/agents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ active: !active })
      });
      if (!res.ok) throw new Error('Failed to update agent');
      await fetchAgents();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Agents</h1>

        <form onSubmit={onCreate} className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <select className="border p-2 rounded" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button disabled={saving} className={`p-2 rounded text-white ${saving?'bg-gray-400':'bg-orange-600 hover:bg-orange-700'}`}>{saving?'Saving...':'Add Agent'}</button>
        </form>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow divide-y">
            {agents.map(a => (
              <div key={a._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{a.name} <span className="text-xs text-gray-500">({a.role})</span></div>
                  <div className="text-sm text-gray-600">{a.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${a.active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{a.active? 'Active' : 'Inactive'}</span>
                  <button onClick={()=>toggleActive(a._id, a.active)} className="px-3 py-1 rounded border hover:bg-gray-50">{a.active? 'Deactivate':'Activate'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
