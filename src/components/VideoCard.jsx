import React from 'react';
import { Play, User, BookOpen, Layers, Send } from 'lucide-react';

export default function VideoCard({ video, onSelect, subject }) {
  return (
    <div
      onClick={() => onSelect(video)}
      className="group bg-white rounded-3xl border border-dark/5 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
    >
      {/* Thumbnail Header Area */}
      <div className="relative h-44 bg-gradient-to-br from-dark/95 via-dark/90 to-dark/80 p-5 flex flex-col justify-between overflow-hidden">
        {/* Subtle decorative circle */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-accent/20 blur-2xl group-hover:bg-accent/40 transition-colors" />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple text-dark shadow-pill">
            <Layers className="w-3 h-3" />
            {video.chapterNumber || 'HSC'}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow text-dark shadow-pill">
            <BookOpen className="w-3 h-3" />
            {video.courseName || 'Course'}
          </span>
        </div>

        {/* Play Icon center overlay */}
        <div className="z-10 flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-accent/90 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
          <span className="text-[11px] font-semibold text-white/70 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
            Telegram Embed
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-dark group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>
          {video.chapterName && (
            <p className="text-xs text-dark/60 mt-1 font-medium">
              {video.chapterName}
            </p>
          )}
        </div>

        {/* Footer info: Teacher */}
        <div className="pt-3 border-t border-dark/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-dark/80">
            <div className="w-6 h-6 rounded-full bg-dark/5 flex items-center justify-center text-dark">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>{video.teacherName || 'Teacher'}</span>
          </div>

          <span className="text-xs font-bold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>Watch</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}
