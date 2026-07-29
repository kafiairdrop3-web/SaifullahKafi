import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Settings, Flame, ShieldCheck, HelpCircle } from 'lucide-react';
import { isDemoMode } from '../services/firebase';

export default function Navbar({ onOpenHelpModal }) {
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

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <Link
            to="/admin?tab=settings"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isDemoMode
                ? 'bg-yellow/20 border-yellow text-dark hover:bg-yellow/30'
                : 'bg-purple/20 border-purple text-dark hover:bg-purple/30'
            }`}
            title="Click to view Firebase connection settings"
          >
            {isDemoMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                <span>Demo Mode (Sample Data)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-dark" />
                <span>Connected to Firebase</span>
              </>
            )}
          </Link>

          {/* Quick Setup Guide Button for Non-Coder */}
          <button
            onClick={onOpenHelpModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-dark/5 hover:bg-dark/10 text-dark transition-all"
          >
            <HelpCircle className="w-4 h-4 text-accent" />
            <span>Setup Guide</span>
          </button>

          {/* Admin Panel Button */}
          <Link
            to="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-pill ${
              isAdminPage
                ? 'bg-dark text-white'
                : 'bg-accent text-white hover:bg-accent/90 hover:scale-105'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
