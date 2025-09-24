import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft } from 'lucide-react';

const ClientDetails = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const api = import.meta.env.VITE_ADMIN_API;

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const res = await fetch(`${api}/api/clients/${encodeURIComponent(email)}/tickets`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        if (res.status === 401) { navigate('/login'); return; }
        if (!res.ok) throw new Error('Failed to fetch client tickets');
        const data = await res.json();
        setTickets(data);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [email, api, navigate]);

  const handleDelete = async (ticketId) => {
    if (!ticketId) return;
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      setDeletingId(ticketId);
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const res = await fetch(`${api}/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.status === 401) { navigate('/login'); return; }
      if (!res.ok) throw new Error('Failed to delete ticket');
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
    } catch (e) {
      alert(e.message || 'Failed to delete ticket');
    } finally {
      setDeletingId(null);
    }
  };

  const clientName = tickets[0]?.name || '';
  const clientPhone = tickets[0]?.phone || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 px-6 pt-28 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Client Info Card */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-orange-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Details</h1>
          <div className="grid sm:grid-cols-3 gap-4 text-gray-700">
            <div>
              <span className="block text-sm font-semibold text-gray-500">Email</span>
              <span className="text-gray-900">{email}</span>
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-500">Name</span>
              <span className="text-gray-900">{clientName || '—'}</span>
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-500">Phone</span>
              <span className="text-gray-900">{clientPhone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-orange-100">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Tickets</h2>
            <span className="text-sm text-gray-500">
              Total: {tickets.length}
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading tickets...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : tickets.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No tickets for this client.</div>
          ) : (
            <div className="divide-y">
              {/* Table Head */}
              <div className="grid grid-cols-12 gap-2 px-6 py-3 text-xs font-semibold text-gray-600 bg-gray-50">
                <div className="col-span-7">Subject</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {/* Table Rows */}
              {tickets.map((t) => (
                <div
                  key={t._id}
                  className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-orange-50/40 transition-colors"
                >
                  <div className="col-span-7">
                    <div className="font-medium text-gray-900">{t.subject}</div>
                    <div className="text-xs text-gray-500">Token #{t.token}</div>
                  </div>
                  <div className="col-span-3">
                    <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-700">
                      {t.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-3">
                    <Link
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                      to={`/tickets/${t._id}`}
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleDelete(t._id)}
                      disabled={deletingId === t._id}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-60"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === t._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
