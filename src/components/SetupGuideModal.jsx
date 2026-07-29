import React from 'react';
import { X, ExternalLink, Sparkles, Shield, Database, Video, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SetupGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-dark/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-dark/10 max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-offwhite border-b border-dark/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark">
                How to Setup Your Website (No Coding Required)
              </h2>
              <p className="text-xs text-dark/60">
                Step-by-step guide for non-coder website owners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-dark/5 hover:bg-dark text-dark hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-dark/80">
          <div className="bg-yellow/20 border border-yellow-dark/20 rounded-2xl p-4 text-xs space-y-1">
            <p className="font-bold text-dark flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Right now, your website is running in Demo Mode with sample videos!</span>
            </p>
            <p className="text-dark/70">
              You can test all filtering, adding, editing, and deleting right now. Follow these 4 steps whenever you're ready to connect a live free database:
            </p>
          </div>

          <ol className="space-y-4 list-decimal list-inside">
            <li className="p-4 rounded-2xl bg-offwhite border border-dark/5 space-y-1">
              <b className="text-dark">Step 1: Create a Free Firebase Project</b>
              <p className="text-xs text-dark/70">
                Go to{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-bold underline inline-flex items-center gap-1"
                >
                  <span>console.firebase.google.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                , sign in with your Google account, click <b>"Create a project"</b>, name it <b>"HSC-Study-Hub"</b>, and click Continue.
              </p>
            </li>

            <li className="p-4 rounded-2xl bg-offwhite border border-dark/5 space-y-1">
              <b className="text-dark">Step 2: Enable Firestore & Authentication</b>
              <p className="text-xs text-dark/70">
                In your Firebase left sidebar, click <b>Build → Firestore Database → Create Database</b> (choose "Start in Production mode"). Next, click <b>Build → Authentication → Get Started</b>, enable <b>Email/Password</b>, and click <b>"Add User"</b> to create your single Admin email and password.
              </p>
            </li>

            <li className="p-4 rounded-2xl bg-offwhite border border-dark/5 space-y-1">
              <b className="text-dark">Step 3: Connect Your Website</b>
              <p className="text-xs text-dark/70">
                Click the Gear icon ⚙️ at the top left of Firebase → <b>Project Settings → General → Your apps</b>. Click the Web icon <code>&lt;/&gt;</code>, copy your API Key, Auth Domain, and Project ID. Then open the{' '}
                <Link
                  to="/admin?tab=settings"
                  onClick={onClose}
                  className="text-accent font-bold underline"
                >
                  Admin Panel → Firebase Settings
                </Link>{' '}
                and paste them there. No file editing needed!
              </p>
            </li>

            <li className="p-4 rounded-2xl bg-offwhite border border-dark/5 space-y-1">
              <b className="text-dark">Step 4: Upload & Stream Telegram Videos</b>
              <p className="text-xs text-dark/70">
                Create a <b>Public Telegram Channel</b> (e.g. <code>t.me/hsc_classes_2026</code>) and post your video files there. When adding a video in the Admin Panel, paste the post link like <code>hsc_classes_2026/10</code> or the full URL. Our built-in player embeds it instantly!
              </p>
            </li>
          </ol>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-offwhite border-t border-dark/5 flex items-center justify-between">
          <Link
            to="/admin?tab=settings"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-purple text-dark hover:bg-purple/80 transition-all shadow-pill"
          >
            Go to Firebase Settings →
          </Link>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold bg-dark text-white hover:bg-dark/80 transition-all shadow-pill"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
