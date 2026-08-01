import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-dark/5 sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-xl shadow-pill group-hover:scale-105 transition-transform">
            H
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide text-dark flex items-center gap-2">
              HSC Study Hub
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow/40 text-dark border border-yellow-dark/20">
                Learnify v1
              </span>
            </h1>
            <p className="text-xs text-dark/60 font-medium">
              Personal HSC Study & Video Organizer
            </p>
          </div>
        </Link>

        {isAdminPage && (
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-dark text-white transition-all shadow-pill"
          >
            <Settings className="w-4 h-4" />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>
    </header>
  );
}
