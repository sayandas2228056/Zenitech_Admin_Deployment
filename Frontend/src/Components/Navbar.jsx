import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../assets/Logo.jpg';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Check if we should hide the navbar
  const hide = location.pathname === '/login' || location.pathname === '/auth-otp';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setShowNavbar(currentScrollY < lastScrollY || currentScrollY < 10);
    setLastScrollY(currentScrollY);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setShowProfileMenu(false);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
    document.body.style.overflow = 'auto';
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideProfile = profileMenuRef.current && profileMenuRef.current.contains(event.target);
      
      if (!isClickInsideProfile) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      // Close mobile menu on orientation change
      setIsMobileMenuOpen(false);
      setShowProfileMenu(false);
      document.body.style.overflow = 'auto';
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'Clients', link: '/clients' },
  ];

  // Return null early if we should hide the navbar
  if (hide) return null;

  return (
    <>
      <nav
        className={`fixed w-full z-[1000] transition-all duration-500 ease-out ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        } enhanced-navbar`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-18">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2 sm:gap-3 group z-10">
            <div className="relative">
              <img 
                src={Logo} 
                alt="Zenitech Solutions Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="font-bold text-orange-500 text-sm sm:text-xl lg:text-2xl xl:text-3xl transition-colors duration-300 group-hover:text-orange-600">
              Zenitech <span className="text-blue-500 group-hover:text-blue-600">Solutions</span>
            </div>
          </NavLink>

          {/* Nav Links (Desktop) */}
          <div className="hidden lg:flex gap-1 items-center justify-center flex-1 max-w-md">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.link}
                className={({ isActive }) =>
                  `nav-link font-medium px-4 py-2.5 relative transition-all duration-300 rounded-xl hover:scale-105 ${
                    isActive
                      ? 'text-orange-600 bg-orange-50/80 shadow-sm scale-105'
                      : 'text-slate-700 hover:text-orange-600 hover:bg-orange-50/80'
                  }`
                }
              >
                {item.name}
                <span className="nav-underline" />
              </NavLink>
            ))}
          </div>

          {/* User Actions (Desktop) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="profile-trigger flex items-center gap-2 p-2 pr-3 sm:pr-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-50 hover:from-orange-100 hover:to-orange-100 text-slate-700 hover:text-slate-900 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-xs sm:text-sm hidden md:block max-w-20 lg:max-w-none truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <div className={`profile-menu absolute top-full right-0 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl py-3 min-w-[200px] sm:min-w-[220px] mt-2 border border-slate-200/50 transition-all duration-300 ${
                    showProfileMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
                  }`}>
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{user.name || user.email.split('@')[0]}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Minimal menu: removed Profile and Settings */}
                    
                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="hidden sm:inline-block sign-in-btn px-4 lg:px-6 py-2.5 lg:py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign In
              </NavLink>
            )}
            
            <button 
              onClick={toggleMobileMenu} 
              className="sm:hidden lg:hidden focus:outline-none p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all duration-300 hover:scale-110"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Tablet menu button */}
            <button 
              onClick={toggleMobileMenu} 
              className="hidden sm:block lg:hidden focus:outline-none p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all duration-300 hover:scale-110"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        <div className={`mobile-menu lg:hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-xl">
            <div className="px-4 sm:px-6 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {user && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{user.name || user.email.split('@')[0]}</p>
                      <p className="text-sm text-slate-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl font-medium text-sm transition-all duration-200"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.link}
                    className={({ isActive }) =>
                      `block py-4 px-4 font-semibold rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'text-orange-600 bg-orange-50' 
                          : 'text-slate-800 hover:text-orange-600 hover:bg-orange-50/50'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
              
              {!user && (
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <NavLink
                    to="/login"
                    className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .enhanced-navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: none; /* remove thin line */
          box-shadow: none; /* remove shadow that can appear as a line */
        }
        
        .nav-link {
          position: relative;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: -0.01em;
        }
        
        .nav-underline {
          position: absolute;
          left: 50%;
          right: 50%;
          bottom: 6px;
          height: 2px;
          background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);
          border-radius: 2px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-link:hover .nav-underline {
          left: 12px;
          right: 12px;
        }
        
        .sign-in-btn {
          letter-spacing: -0.01em;
          border: 1px solid rgba(249, 115, 22, 0.2);
        }
        
        .profile-trigger:hover {
          transform: translateY(-1px) scale(1.02);
        }
        
        .profile-menu {
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
        }
        
        .mobile-menu {
          box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.12);
        }
        
        /* Enhanced responsive breakpoints */
        @media (max-width: 640px) {
          .enhanced-navbar {
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
          }
        }
        
        /* Landscape mobile optimization */
        @media screen and (max-height: 500px) and (orientation: landscape) {
          .mobile-menu > div > div {
            max-height: calc(100vh - 3rem);
            padding: 1rem;
          }
          
          .mobile-menu .space-y-1 > * {
            padding: 0.75rem 1rem;
          }
        }
        
        /* High DPI displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .enhanced-navbar {
            border-bottom: none; /* ensure no line on high-DPI */
          }
        }
        
        /* Tablet landscape specific */
        @media (min-width: 768px) and (max-width: 1023px) and (orientation: landscape) {
          .profile-menu {
            min-width: 200px;
          }
        }
        
        /* Ultra-wide screen optimization */
        @media (min-width: 1536px) {
          .enhanced-navbar > div {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
        
        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-navbar,
          .nav-link,
          .nav-underline,
          .profile-trigger,
          .profile-menu,
          .mobile-menu {
            transition: none;
            animation: none;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .enhanced-navbar {
            background: rgba(255, 255, 255, 0.95);
            border-bottom: none; /* remove line in dark mode too */
          }
        }
        
        /* Focus visible styles for accessibility */
        .nav-link:focus-visible,
        .sign-in-btn:focus-visible {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default Navbar;