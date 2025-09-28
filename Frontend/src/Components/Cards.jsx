import React, { useMemo } from "react";
import {
  Ticket,
  User,
  Mail,
  Phone,
  Eye,
  Calendar,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

// Status colors centralised
const STATUS_STYLES = {
  Open: {
    badge: "bg-green-50 text-green-800 border-green-200 shadow-green-100",
    dot: "bg-green-500 shadow-green-200",
  },
  "In Progress": {
    badge: "bg-yellow-50 text-yellow-800 border-yellow-200 shadow-yellow-100",
    dot: "bg-amber-500 shadow-amber-200",
  },
  Closed: {
    badge: "bg-red-50 text-red-800 border-red-200 shadow-red-100",
    dot: "bg-red-500 shadow-red-200",
  },
  Default: {
    badge: "bg-orange-50 text-orange-800 border-orange-200 shadow-orange-100",
    dot: "bg-orange-500 shadow-orange-200",
  },
};

// Info block component
const InfoBlock = ({ icon: Icon, label, value, gradient }) => (
  <div
    className={`flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl border shadow-sm ${gradient}`}
  >
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-700">
        {label}
      </p>
      <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const Cards = ({ tickets, deletingId, onDelete, onStatusChange }) => {
  const hasTickets = tickets?.length > 0;

  if (!hasTickets) {
    return (
      <div className="col-span-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-200/50 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-12 h-12 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No tickets found
          </h3>
          <p className="text-amber-700/80 text-lg leading-relaxed max-w-md mx-auto">
            Try adjusting your search or filter criteria to find what you're
            looking for
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {tickets.map((ticket, index) => {
        const statusStyle =
          STATUS_STYLES[ticket.status] || STATUS_STYLES.Default;

        return (
          <div
            key={ticket._id}
            className="group bg-white/85 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-orange-200/50 overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 animate-slideInUp"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-4 sm:p-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <p className="text-orange-100 text-[10px] sm:text-xs uppercase tracking-wider font-medium">
                        Token
                      </p>
                      <p className="font-bold text-lg sm:text-xl">#{ticket.token}</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full ${statusStyle.dot} shadow-lg`}
                  />
                </div>

                <h3 className="font-bold text-lg sm:text-xl mb-2 leading-tight line-clamp-2">
                  {ticket.subject}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 text-xs sm:text-sm gap-2">
                  <div className="flex items-center gap-2 text-orange-100">
                    <Calendar className="w-4 h-4" />
                    <span>Support Request</span>
                  </div>
                  <time className="bg-white/20 px-2 py-1 rounded-full w-fit">
                    {new Date(ticket.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Customer Info */}
              <div className="space-y-4">
                <InfoBlock
                  icon={User}
                  label="Customer"
                  value={ticket.name}
                  gradient="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100"
                />
                <InfoBlock
                  icon={Mail}
                  label="Email"
                  value={ticket.email}
                  gradient="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100"
                />
                <InfoBlock
                  icon={Phone}
                  label="Phone"
                  value={ticket.phone}
                  gradient="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100"
                />
              </div>

              {/* Description */}
              <div className="bg-gradient-to-r from-gray-50 to-orange-50/50 rounded-2xl p-3 sm:p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-800" />
                  <Link
                    to={`/tickets/${ticket._id}`}
                    className="text-amber-800 font-semibold hover:text-orange-700 transition-colors flex items-center gap-2"
                  >
                    View Full Details
                  </Link>
                  <Link
                    to={`/tickets/${ticket._id}`}
                    className="text-xs text-amber-600 hover:text-orange-700 ml-auto"
                  >
                    Click to expand
                  </Link>
                </div>
                <Link
                  to={`/tickets/${ticket._id}`}
                  className="group flex items-center justify-between text-orange-600 hover:text-orange-700 transition-colors mt-2"
                >
                  <p className="text-sm line-clamp-3">
                    {ticket.description || "No description provided"}
                  </p>
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                  <div
                    className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border shadow-sm ${statusStyle.badge}`}
                  >
                    {ticket.status || "Open"}
                  </div>
                  <select
                    value={ticket.status || "Open"}
                    onChange={(e) =>
                      onStatusChange?.(ticket._id, e.target.value)
                    }
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <button
                  onClick={() => onDelete(ticket._id)}
                  disabled={deletingId === ticket._id}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    deletingId === ticket._id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-500 hover:to-red-600 hover:text-white border border-red-200 hover:border-red-500 transform hover:scale-105 shadow-sm hover:shadow-lg"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === ticket._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Animation styles once globally */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideInUp { animation: slideInUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .line-clamp-2, .line-clamp-3 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 { -webkit-line-clamp: 2; }
        .line-clamp-3 { -webkit-line-clamp: 3; }
      `}</style>
    </>
  );
};

export default Cards;
