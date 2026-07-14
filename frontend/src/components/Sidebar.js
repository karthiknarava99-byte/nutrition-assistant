import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/meals', icon: '🍽️', label: 'Meal Log' },
  { to: '/nutrition', icon: '📊', label: 'Nutrition' },
  { to: '/recipes', icon: '📖', label: 'Recipes' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🥗</div>
        <div>
          <div className="logo-text">NutriAssist</div>
          <div className="logo-sub">Health & Wellness</div>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-label">Account</div>
        <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="icon">👤</span>
          Profile & Goals
        </NavLink>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', textAlign: 'left', background: 'none', color: '#ef4444' }}
        >
          <span className="icon">🚪</span>
          Logout
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
