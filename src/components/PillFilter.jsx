import React from 'react';
import { Filter, X, Check, BookOpen, Layers, User } from 'lucide-react';

export default function PillFilter({
  tags,
  selectedCourses,
  selectedChapters,
  selectedTeachers,
  onToggleCourse,
  onToggleChapter,
  onToggleTeacher,
  onClearAll
}) {
  const hasActiveFilters =
    selectedCourses.length > 0 ||
    selectedChapters.length > 0 ||
    selectedTeachers.length > 0;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-dark/5 p-5 sm:p-6 shadow-card space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dark/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-dark">Filter Class Videos</h3>
            <p className="text-xs text-dark/60">
              Click pill buttons to filter by Course, Chapter, and Teacher (AND logic)
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-accent/15 hover:bg-accent hover:text-white text-accent transition-all duration-200"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>
        )}
      </div>

      {/* 1. By Course */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-dark/60">
          <BookOpen className="w-3.5 h-3.5 text-accent" />
          <span>By Course</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.course && tags.course.length > 0 ? (
            tags.course.map((c) => {
              const isSelected = selectedCourses.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => onToggleCourse(c)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-pill ${
                    isSelected
                      ? 'bg-accent text-white scale-105 shadow-md'
                      : 'bg-offwhite text-dark/80 hover:bg-dark/10 hover:text-dark'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{c}</span>
                </button>
              );
            })
          ) : (
            <span className="text-xs text-dark/40 italic">
              No course tags added for this subject yet.
            </span>
          )}
        </div>
      </div>

      {/* 2. By Chapter */}
      <div className="space-y-2.5 pt-2 border-t border-dark/5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-dark/60">
          <Layers className="w-3.5 h-3.5 text-purple-dark" />
          <span>By Chapter</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.chapter && tags.chapter.length > 0 ? (
            tags.chapter.map((ch) => {
              const isSelected = selectedChapters.includes(ch);
              return (
                <button
                  key={ch}
                  onClick={() => onToggleChapter(ch)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-pill ${
                    isSelected
                      ? 'bg-purple text-dark scale-105 shadow-md font-bold'
                      : 'bg-offwhite text-dark/80 hover:bg-dark/10 hover:text-dark'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{ch}</span>
                </button>
              );
            })
          ) : (
            <span className="text-xs text-dark/40 italic">
              No chapter tags added for this subject yet.
            </span>
          )}
        </div>
      </div>

      {/* 3. By Teacher */}
      <div className="space-y-2.5 pt-2 border-t border-dark/5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-dark/60">
          <User className="w-3.5 h-3.5 text-dark/70" />
          <span>By Teacher</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.teacher && tags.teacher.length > 0 ? (
            tags.teacher.map((t) => {
              const isSelected = selectedTeachers.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => onToggleTeacher(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-pill ${
                    isSelected
                      ? 'bg-yellow text-dark scale-105 shadow-md font-bold'
                      : 'bg-offwhite text-dark/80 hover:bg-dark/10 hover:text-dark'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{t}</span>
                </button>
              );
            })
          ) : (
            <span className="text-xs text-dark/40 italic">
              No teacher tags added for this subject yet.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
