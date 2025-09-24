import React, { useEffect, useState, useCallback } from "react";
import { Ticket, Clock, RefreshCw, Search, AlertCircle, Menu } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import Cards from "../Components/Cards";
import { useAuth } from "../context/AuthContext";
import ScreenshotUpload from "../Components/ScreenshotUpload";
import SupportNavbar from "../Components/SupportNavbar";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized');
      }
      
      const api = import.meta.env.VITE_ADMIN_API;
      if (!api) {
        throw new Error('API URL not configured');
      }

      const res = await fetch(`${api}/api/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (res.status === 401) {
        logout();
        navigate('/login');
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
      console.error('Error fetching tickets:', e);
      setError(e.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  // Function to refresh tickets
  const refreshTickets = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusChange = async (ticketId, newStatus) => {
    if (!ticketId || !newStatus) {
      console.error('Invalid ticket ID or status');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required');
      return;
    }

    // Store original state for rollback
    const originalTickets = [...tickets];
    
    // Optimistic update
    setTickets((prev) => 
      prev.map((t) => t._id === ticketId ? { ...t, status: newStatus } : t)
    );

    try {
      const api = import.meta.env.VITE_ADMIN_API;
      const res = await fetch(`${api}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Failed to update status: ${res.status}`);
      }

      const updated = await res.json();
      setTickets((prev) => 
        prev.map((t) => t._id === ticketId ? updated : t)
      );
    } catch (e) {
      console.error('Error updating status:', e);
      // Rollback optimistic update
      setTickets(originalTickets);
      alert('Failed to update status. Please try again.');
    }
  };

  // Set up a listener for the popstate event to detect when user navigates back
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/dashboard') {
        refreshTickets();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [refreshTickets]);

  // Initial fetch and setup
  useEffect(() => {
    fetchTickets();
    
    const shouldRefresh = sessionStorage.getItem('shouldRefreshTickets');
    if (shouldRefresh) {
      sessionStorage.removeItem('shouldRefreshTickets');
    }
  }, [fetchTickets]);

  const handleDelete = async (ticketId) => {
    if (!ticketId) {
      console.error('Invalid ticket ID');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      setDeletingId(ticketId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const api = import.meta.env.VITE_ADMIN_API;
      const res = await fetch(`${api}/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Failed to delete ticket: ${res.status}`);
      }

      setTickets((prev) => prev.filter(ticket => ticket._id !== ticketId));
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert(`Failed to delete ticket: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.token?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.sidebar-container')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <div className="mt-20 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100 border-t-orange-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-amber-400 animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-amber-800 font-semibold text-lg">Loading your tickets...</p>
          <p className="text-amber-600 text-sm mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-orange-200 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error === 'Forbidden' 
              ? 'You do not have permission to view this page.' 
              : error}
          </p>
          <button 
            onClick={fetchTickets}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-3"
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
  }

  // Main content margin to accommodate sidebar width
  const mainContentMargin = 'md:ml-64';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white shadow-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar (Support Dashboard) */}
      <div className={`sidebar-container fixed inset-y-0 left-0 z-40 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <SupportNavbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onRefresh={fetchTickets}
        />
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        ></div>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${mainContentMargin} transition-all duration-300 ease-in-out min-h-screen`}>
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content Section */}
        <div className="relative max-w-7xl mx-auto px-6 py-10">

          {/* Stats Cards */}
          <div className="mt-8 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">Open</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === "Open").length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === "In Progress").length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Ticket className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">Closed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === "Closed").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* No tickets message */}
          {tickets.length === 0 && !loading ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-6">There are no support tickets to display at the moment.</p>
              <button 
                onClick={fetchTickets}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Refresh
              </button>
            </div>
          ) : (
            <>
              {/* Tickets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <Cards 
                  tickets={filteredTickets} 
                  deletingId={deletingId}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
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

              {/* No filtered results message */}
              {filteredTickets.length === 0 && tickets.length > 0 && (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No matching tickets</h3>
                  <p className="text-gray-600 mb-6">
                    No tickets found matching your current filters.
                    {searchTerm && ` Try different search terms.`}
                  </p>
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                    }}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Screenshot Upload Modal */}
      {showScreenshotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowScreenshotModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close modal"
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