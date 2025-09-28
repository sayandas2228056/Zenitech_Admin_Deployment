import React, { useEffect, useState, useCallback } from "react";
import { Ticket, Clock, RefreshCw, Search, AlertCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Cards from "../Components/Cards";
import ScreenshotUpload from "../Components/ScreenshotUpload";
import SupportNavbar from "../Components/SupportNavbar";

// -------------------- Custom Hook for Tickets --------------------
const useTickets = (logout, navigate) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const api = import.meta.env.VITE_ADMIN_API;
      if (!api) throw new Error("API URL not configured");

      const res = await fetch(`${api}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `HTTP ${res.status}: Failed to fetch tickets`);
      }

      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      console.error("Error fetching tickets:", e);
      setError(e.message || "Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, setTickets, loading, error, fetchTickets };
};

// -------------------- UI Subcomponents --------------------
const StatusCard = ({ title, count, icon: Icon, gradient }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="mt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100 border-t-orange-500 mx-auto mb-6"></div>
        <div
          className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-amber-400 animate-spin mx-auto"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
      </div>
      <p className="text-amber-800 font-semibold text-lg">Loading your tickets...</p>
      <p className="text-amber-600 text-sm mt-1">Please wait while we fetch your data</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="mt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
    <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-orange-200 max-w-md text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {error === "Forbidden" ? "You do not have permission to view this page." : error}
      </p>
      <button
        onClick={onRetry}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-3"
      >
        <RefreshCw className="w-5 h-5 inline mr-2" />
        Try Again
      </button>
      <button
        onClick={() => window.location.reload()}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
      >
        Reload Page
      </button>
    </div>
  </div>
);

// -------------------- Dashboard --------------------
const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { tickets, setTickets, loading, error, fetchTickets } = useTickets(logout, navigate);

  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredTickets = tickets.filter((t) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      t.subject?.toLowerCase().includes(search) ||
      t.name?.toLowerCase().includes(search) ||
      t.token?.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      setDeletingId(ticketId);
      const token = localStorage.getItem("token");
      const api = import.meta.env.VITE_ADMIN_API;

      const res = await fetch(`${api}/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to delete ticket: ${res.status}`);
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
    } catch (err) {
      alert(`Failed to delete ticket: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchTickets} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-md text-gray-700 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar-container fixed inset-y-0 left-0 z-40 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300`}
      >
        <SupportNavbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onRefresh={fetchTickets}
        />
      </div>

      {/* Overlay for Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300 min-h-screen mt-15">
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatusCard title="Total Tickets" count={tickets.length} icon={Ticket} gradient="bg-gradient-to-r from-orange-500 to-amber-500" />
            <StatusCard title="Open" count={tickets.filter((t) => t.status === "Open").length} icon={Clock} gradient="bg-gradient-to-r from-emerald-500 to-teal-500" />
            <StatusCard title="In Progress" count={tickets.filter((t) => t.status === "In Progress").length} icon={RefreshCw} gradient="bg-gradient-to-r from-amber-500 to-yellow-500" />
            <StatusCard title="Closed" count={tickets.filter((t) => t.status === "Closed").length} icon={Ticket} gradient="bg-gradient-to-r from-gray-500 to-slate-600" />
          </div>

          {/* Tickets */}
          {tickets.length === 0 ? (
            <div className="text-center py-20">
              <Ticket className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No tickets found</h3>
              <button
                onClick={fetchTickets}
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-3 px-6 rounded-2xl hover:scale-105 transition-all shadow-lg"
              >
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Refresh
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                <Cards tickets={filteredTickets} deletingId={deletingId} onDelete={handleDelete} />
              </div>
              {/* Results Summary */}
              {filteredTickets.length > 0 && (searchTerm || statusFilter !== "All") && (
                <div className="mt-12 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-orange-200/50 shadow-lg">
                    <Search className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800 font-semibold">
                      Showing {filteredTickets.length} of {tickets.length} tickets
                      {searchTerm && ` matching "${searchTerm}"`}
                      {statusFilter !== "All" && ` with status "${statusFilter}"`}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Screenshot Upload Modal */}
      {showScreenshotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowScreenshotModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
            <ScreenshotUpload onClose={() => setShowScreenshotModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
