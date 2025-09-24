import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingEmail, setDeletingEmail] = useState('');

  const api = import.meta.env.VITE_ADMIN_API;

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${api}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter(
    (c) =>
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const removeClient = async (email) => {
    const confirmed = window.confirm(
      `Delete all data for ${email}? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      setDeletingEmail(email);
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${api}/api/clients/${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Failed to remove client');
      }
      await fetchClients();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Clients
          </h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Main Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg shadow">
            {error}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-4">Client</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-1">Tickets</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {filtered.map((c, idx) => (
              <div
                key={c.email + idx}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition"
              >
                <div className="col-span-4">
                  <div className="font-medium text-gray-900">
                    {c.name || '—'}
                  </div>
                </div>
                <div className="col-span-3 text-gray-700">{c.email}</div>
                <div className="col-span-2 text-gray-700">
                  {c.phone || '—'}
                </div>
                <div className="col-span-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
                    {c.ticketCount}
                  </span>
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-3">
                  <Link
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
                    to={`/clients/${encodeURIComponent(c.email)}`}
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => removeClient(c.email)}
                    disabled={deletingEmail === c.email}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      deletingEmail === c.email
                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                    title="Delete client"
                  >
                    {deletingEmail === c.email ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="p-10 text-center text-gray-600">
                No clients found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
