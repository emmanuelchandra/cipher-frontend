import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard',    label: 'Dashboard',   roles: ['admin', 'hr', 'employee'] },
    { to: '/attendance',   label: 'Attendance',  roles: ['admin', 'hr', 'employee'] },
    { to: '/face-register',label: 'Face Setup',  roles: ['admin', 'hr', 'employee'] },
    { to: '/employees',    label: 'Employees',   roles: ['admin', 'hr'] },
    { to: '/departments',  label: 'Departments', roles: ['admin'] },
    { to: '/shifts',       label: 'Shifts',      roles: ['admin'] },
    { to: '/reports',      label: 'Reports',     roles: ['admin', 'hr', 'employee'] },
    { to: '/settings',     label: 'Settings',    roles: ['admin', 'hr'] },
  ];

  const visible = links.filter(l => hasRole(l.roles));

  const linkClass = (to) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === to
        ? 'bg-white bg-opacity-20 text-white'
        : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
    }`;

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold tracking-widest">CIPHER</span>
            <div className="hidden md:flex ml-8 space-x-1">
              {visible.map(l => (
                <Link key={l.to} to={l.to} className={linkClass(l.to)}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-white text-sm font-semibold">{user?.name}</p>
                <p className="text-blue-200 text-xs capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-600 px-4 pb-4 pt-2 space-y-1">
          {visible.map(l => (
            <Link key={l.to} to={l.to}
              className="block px-3 py-2 rounded text-blue-100 hover:text-white text-sm"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="block px-3 py-2 text-red-300 text-sm w-full text-left">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
