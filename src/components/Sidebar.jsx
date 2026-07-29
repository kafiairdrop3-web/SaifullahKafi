import React from 'react';
import { NavLink } from 'react-router-dom';
import { SUBJECTS } from '../constants/subjects';
import { 
  Home, 
  Settings, 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  BookOpen, 
  Languages, 
  Cpu,
  ChevronRight
} from 'lucide-react';

const iconMap = {
  Calculator: <Calculator className="w-4 h-4" />,
  Atom: <Atom className="w-4 h-4" />,
  FlaskConical: <FlaskConical className="w-4 h-4" />,
  Dna: <Dna className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Languages: <Languages className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-dark/5 flex flex-col justify-between shrink-0 h-[calc(100vh-65px)] sticky top-[65px] hidden lg:flex">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-dark/40 px-3 mb-2">
            Navigation
          </div>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-dark text-white shadow-pill'
                  : 'text-dark/80 hover:bg-dark/5'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </NavLink>
        </div>

        {/* Subjects List Section */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-dark/40 px-3 mb-2">
            HSC Subjects (7)
          </div>
          <nav className="space-y-1">
            {SUBJECTS.map((sub) => (
              <NavLink
                key={sub.id}
                to={`/subject/${sub.id}`}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-accent text-white shadow-pill translate-x-1'
                      : 'text-dark/80 hover:bg-dark/5 hover:translate-x-0.5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      sub.color
                    }`}
                  >
                    {iconMap[sub.icon] || <span>{sub.number}</span>}
                  </span>
                  <span>{sub.name}</span>
                </div>
                <span className="text-[11px] font-bold opacity-60">
                  {sub.number}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Admin Link */}
      <div className="p-4 border-t border-dark/5">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-purple text-dark shadow-pill'
                : 'bg-offwhite text-dark/80 hover:bg-dark/5'
            }`
          }
        >
          <Settings className="w-4 h-4 text-dark" />
          <div className="flex flex-col">
            <span className="leading-none">Admin Panel</span>
            <span className="text-[10px] text-dark/60 font-normal mt-1">
              Manage Videos & Tags
            </span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
