import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Compass,
  Layers,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { NotificationDrawer } from '../components/NotificationDrawer';

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll or fetch unread notifications when authenticated
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const checkCount = () => {
      api.getUnreadNotificationCount().then(setUnreadCount).catch(() => {});
    };
    checkCount();
    const interval = setInterval(checkCount, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap shrink-0 transition-all px-3 py-1.5 rounded-lg ${
      isActive
        ? 'bg-slate-800 text-cyan-300 shadow-xs'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Municipal Status Banner */}
      <div className="bg-[#07111E] border-b border-slate-800/80 text-[11px] text-slate-400 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Smart City Grievance & Operations Network</span>
            <span className="hidden sm:inline text-slate-500">· V2 Enterprise Edition</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden md:inline">24x7 Municipal Triage Active</span>
            <span className="font-mono text-cyan-400">Emergency: 112</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 group"
          >
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight leading-none text-white">
                Civic<span className="text-cyan-400">Pulse</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 leading-tight">
                Smart City Ops
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/map" className={navLinkClass('/map')}>
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                City Map
              </span>
            </Link>
            <Link to="/track" className={navLinkClass('/track')}>
              Track Status
            </Link>
            {user?.role === 'CITIZEN' && (
              <Link to="/citizen" className={navLinkClass('/citizen')}>
                Citizen Portal
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className={navLinkClass('/admin')}>
                Admin Console
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            {user && (
              <button
                type="button"
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
                aria-label="Open notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cyan-400 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                      {user.fullName}
                    </p>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {user.role === 'ADMIN' ? 'Admin' : user.ward || 'Citizen'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-lg shadow-md shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  Report Issue
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu and bell trigger */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 text-slate-300 hover:text-white"
                aria-label="Open notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cyan-400 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#0B192C] px-4 py-4 space-y-2 text-sm">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-slate-200 font-medium rounded-lg hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-cyan-300 font-medium rounded-lg hover:bg-slate-800"
            >
              Live City Issue Map
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-slate-200 font-medium rounded-lg hover:bg-slate-800"
            >
              Track Complaint Status
            </Link>
            {user?.role === 'CITIZEN' && (
              <Link
                to="/citizen"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-slate-200 font-medium rounded-lg hover:bg-slate-800"
              >
                Citizen Portal
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-slate-200 font-medium rounded-lg hover:bg-slate-800"
              >
                Admin Console
              </Link>
            )}

            <div className="pt-3 border-t border-slate-800">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-xs text-slate-400">
                    Signed in as <strong className="text-white">{user.fullName}</strong> ({user.role})
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-900 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>

      {/* Persistent Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onSelectComplaint={(trackingCode) => {
          navigate(`/track?code=${encodeURIComponent(trackingCode)}`);
        }}
        onUnreadChange={setUnreadCount}
      />

      {/* Modern Civic Footer */}
      <footer className="bg-[#0B192C] text-slate-300 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3.5">
            <div className="inline-flex items-center gap-2 text-base font-black text-white">
              <div className="p-1.5 rounded-lg bg-cyan-500 text-slate-950">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>
                Civic<span className="text-cyan-400">Pulse</span> V2
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Report. Track. Resolve. Build Better Cities. An intelligent civic infrastructure grievance and operations platform connecting citizens directly with municipal response teams.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                Spring Boot 4 / Java 25
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                React 19 / TS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                Leaflet GIS
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white text-sm">Citizen Portal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/map" className="hover:text-cyan-400 transition-colors">
                  Interactive City Map
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-cyan-400 transition-colors">
                  Track Complaint Code
                </Link>
              </li>
              <li>
                <Link to="/citizen" className="hover:text-cyan-400 transition-colors">
                  Report New Issue
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-cyan-400 transition-colors">
                  Citizen Authentication
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white text-sm">Municipal Administration</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/admin" className="hover:text-cyan-400 transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cyan-400 transition-colors">
                  Workforce Analytics
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-cyan-400 transition-colors">
                  Spatial Hotspot Review
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Department Dispatch Hub</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 bg-[#07111E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} CivicPulse Municipal Platform · Round 2 Evaluation Edition</span>
            <span className="text-slate-400 font-mono">Status: All Municipal Micro-Services Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
