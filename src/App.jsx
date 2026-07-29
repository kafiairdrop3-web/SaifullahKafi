import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import AdminPage from './pages/AdminPage';
import SetupGuideModal from './components/SetupGuideModal';

export default function App() {
  const [showSetupModal, setShowSetupModal] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-offwhite flex flex-col font-sans selection:bg-yellow selection:text-dark">
        {/* Top Navbar */}
        <Navbar onOpenHelpModal={() => setShowSetupModal(true)} />

        {/* Body Layout */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Persistent Sidebar (Desktop) */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/subject/:subjectId" element={<SubjectPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Non-Coder Setup Guide Modal */}
        <SetupGuideModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
        />
      </div>
    </BrowserRouter>
  );
}
