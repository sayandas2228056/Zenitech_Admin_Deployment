import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingEmail, setDeletingEmail] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", phone: "" });

  const api = import.meta.env.VITE_ADMIN_API;

  const getToken = () => localStorage.getItem("token");

  /** Fetch Clients */
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${api}/api/clients`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch clients");
      setClients(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /** Add Client */
  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${api}/api/clients`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to add client");
      }
      setShowAdd(false);
      fetchClients();
    } catch (e) {
      alert(e.message);
    }
  };

  /** Delete Client */
  const removeClient = async (email) => {
    if (!window.confirm(`Delete all data for ${email}? This cannot be undone.`))
      return;

    try {
      setDeletingEmail(email);
      const res = await fetch(
        `${api}/api/clients/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
          credentials: "include",
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to remove client");
      }
      fetchClients();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingEmail("");
    }
  };

  /** Filtered Clients */
  const filtered = clients.filter(
    (c) =>
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                Add Client
              </button>
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
              {filtered.map((c) => (
                <div
                  key={c.email}
                  className="grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition"
                >
                  <div className="col-span-4 font-medium text-gray-900">
                    {c.name || "—"}
                  </div>
                  <div className="col-span-3 text-gray-700">{c.email}</div>
                  <div className="col-span-2 text-gray-700">
                    {c.phone || "—"}
                  </div>
                  <div className="col-span-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
                      {c.ticketCount ?? 0}
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
                          ? "bg-red-100 text-red-400 cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {deletingEmail === c.email ? "Deleting…" : "Delete"}
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

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Add Client</h2>
            <form onSubmit={submitAdd} className="space-y-4">
              {["email", "name", "phone"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    required={field === "email"}
                    value={form[field]}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder={
                      field === "email"
                        ? "user@example.com"
                        : field === "name"
                        ? "Full name"
                        : "Phone number"
                    }
                  />
                </div>
              ))}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Clients;
