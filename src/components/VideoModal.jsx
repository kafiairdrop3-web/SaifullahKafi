import React, { useEffect, useRef } from 'react';
import { X, ExternalLink, Play, BookOpen, Layers, User, AlertCircle } from 'lucide-react';
import { normalizeTelegramLink } from '../services/videoService';

export default function VideoModal({ video, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!video || !containerRef.current) return;

    // Clear previous widget content
    containerRef.current.innerHTML = '';

    const cleanPostId = normalizeTelegramLink(video.telegramPostLink);
    if (!cleanPostId || !cleanPostId.includes('/')) {
      return;
    }

    // Dynamically inject Telegram widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-post', cleanPostId);
    script.setAttribute('data-width', '100%');
    script.async = true;

    containerRef.current.appendChild(script);
  }, [video]);

  if (!video) return null;

  const cleanPostId = normalizeTelegramLink(video.telegramPostLink);
  const telegramUrl = cleanPostId
    ? `https://t.me/${cleanPostId}`
    : 'https://telegram.org';

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
        <div className="p-5 sm:p-6 bg-offwhite border-b border-dark/5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple text-dark">
                {video.chapterNumber || 'Chapter'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow text-dark">
                {video.courseName || 'Course'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dark/10 text-dark">
                {video.teacherName || 'Teacher'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-dark leading-snug">
              {video.title}
            </h2>
            {video.chapterName && (
              <p className="text-xs text-dark/60 font-medium">
                {video.chapterName}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-dark/5 hover:bg-accent hover:text-white text-dark flex items-center justify-center transition-all shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Telegram Embed Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="min-h-[220px] sm:min-h-[300px] bg-offwhite/50 rounded-2xl border border-dark/5 p-4 flex flex-col items-center justify-center relative overflow-x-auto">
            {!cleanPostId || !cleanPostId.includes('/') ? (
              <div className="text-center p-6 max-w-sm space-y-3">
                <AlertCircle className="w-10 h-10 text-accent mx-auto" />
                <p className="text-sm font-semibold text-dark">
                  Invalid Telegram Post Link
                </p>
                <p className="text-xs text-dark/60">
                  Expected format: <code>CHANNEL_USERNAME/POST_ID</code> (e.g.,{' '}
                  <code>ACS_HSC_26/102</code>).
                </p>
              </div>
            ) : (
              <div
                ref={containerRef}
                className="w-full flex justify-center overflow-hidden"
              />
            )}
          </div>

          {/* Graceful Fallback Section (per Section 5) */}
          <div className="bg-yellow/15 border border-yellow-dark/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-dark/80 space-y-0.5 text-center sm:text-left">
              <p className="font-bold text-dark">
                Video not embedding correctly?
              </p>
              <p>
                Some Telegram channel post types restrict inline widgets. You can play directly on Telegram:
              </p>
            </div>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all flex items-center gap-1.5 shrink-0 shadow-pill"
            >
              <span>Watch on Telegram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-offwhite border-t border-dark/5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold bg-dark text-white hover:bg-dark/80 transition-all shadow-pill"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
