import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

const SupportNavbar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onRefresh }) => {
  return (
    <aside className="h-full w-64 bg-white/90 backdrop-blur-md border-r border-orange-200/50 shadow-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 border-b border-orange-200/40 mt-20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent">
          Support
        </h1>
        <p className="text-amber-700/80 text-xs mt-1">Dashboard</p>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/60 w-4 h-4 transition-colors group-focus-within:text-orange-600" />
          <input
            type="text"
            placeholder="Search tickets, names, tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-orange-200 rounded-xl w-full bg-white/90 backdrop-blur-sm text-gray-900 placeholder-amber-600/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-300"
          />
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600/60 w-4 h-4 transition-colors group-focus-within:text-orange-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm border border-orange-200 rounded-xl w-full bg-white/90 backdrop-blur-sm appearance-none cursor-pointer text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-300"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow transition-transform duration-300 transform hover:scale-105 hover:shadow-md hover:from-orange-600 hover:to-amber-700 whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </aside>
  );
};

export default SupportNavbar;
