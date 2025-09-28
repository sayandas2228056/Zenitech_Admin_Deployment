import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', link: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Clients', link: '/clients', icon: <Users size={20} /> },
    { name: 'Tickets', link: '/tickets', icon: <Ticket size={20} /> },
  ];

  return (
    <div
      className={`h-screen bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-bold text-orange-600">Menu</h2>}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name} className="relative group">
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center transition-colors duration-200 rounded-lg ${
                    isCollapsed ? 'justify-center' : 'px-4'
                  } py-3 ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>

              {/* Tooltip for collapsed sidebar */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
