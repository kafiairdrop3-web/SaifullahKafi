import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SUBJECTS } from '../constants/subjects';
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  BookOpen, 
  Languages, 
  Cpu, 
  ArrowRight, 
  Play, 
  Sparkles,
  Layers,
  Video
} from 'lucide-react';
import { getVideosBySubject } from '../services/videoService';

const iconMap = {
  Calculator: <Calculator className="w-6 h-6" />,
  Atom: <Atom className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Dna: <Dna className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Languages: <Languages className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />
};

export default function HomePage() {
  const [videoCounts, setVideoCounts] = useState({});

  useEffect(() => {
    async function fetchCounts() {
      const counts = {};
      for (const sub of SUBJECTS) {
        const list = await getVideosBySubject(sub.id);
        counts[sub.id] = list.length;
      }
      setVideoCounts(counts);
    }
    fetchCounts();
  }, []);

  const totalVideos = Object.values(videoCounts).reduce((acc, c) => acc + c, 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-dark via-dark/95 to-dark/90 text-white rounded-3xl p-6 sm:p-12 shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Decorative ambient blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute left-1/3 -bottom-20 w-60 h-60 rounded-full bg-purple/30 blur-3xl" />

        <div className="max-w-xl space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/10 text-yellow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HSC Preparation Made Simple</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Organize & Stream Your{' '}
            <span className="text-accent underline decoration-yellow decoration-wavy decoration-2">
              HSC Class Videos
            </span>
          </h1>

          <p className="text-sm sm:text-base text-offwhite/80 leading-relaxed font-normal">
            Filter class videos by Course Name, Chapter Number, and Teacher Name. All your class links from Telegram embedded seamlessly in one structured dashboard.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/subject/physics"
              className="px-6 py-3 rounded-full text-sm font-bold bg-accent text-white hover:bg-accent/90 transition-all shadow-pill flex items-center gap-2 hover:scale-105"
            >
              <span>Explore Physics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin"
              className="px-6 py-3 rounded-full text-sm font-bold bg-white/15 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
            >
              <span>Manage Videos (Admin)</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 w-full md:w-72 space-y-4 shrink-0 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow">
              Dashboard Overview
            </span>
            <Video className="w-4 h-4 text-purple" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-white/10 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-bold text-white">7</div>
              <div className="text-[11px] text-white/70 font-semibold mt-0.5">
                Subjects
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3.5 text-center">
              <div className="text-2xl font-bold text-accent">
                {totalVideos || 0}
              </div>
              <div className="text-[11px] text-white/70 font-semibold mt-0.5">
                Total Videos
              </div>
            </div>
          </div>

          <div className="text-[11px] text-white/60 text-center pt-2 border-t border-white/10">
            Powered by Telegram Video Embeds & Firestore
          </div>
        </div>
      </div>

      {/* Subjects Grid Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark">
            HSC Subjects Directory
          </h2>
          <p className="text-xs sm:text-sm text-dark/60">
            Select a subject to browse filtered courses, chapters, and teacher videos
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {SUBJECTS.map((sub) => {
          const count = videoCounts[sub.id] || 0;
          return (
            <Link
              key={sub.id}
              to={`/subject/${sub.id}`}
              className="group bg-white rounded-3xl border border-dark/5 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Subtle accent border on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-yellow to-purple opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-pill transition-transform group-hover:scale-110 ${sub.color}`}
                  >
                    {iconMap[sub.icon] || <span>{sub.number}</span>}
                  </div>
                  <span className="text-xs font-bold text-dark/40">
                    #{sub.number}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-dark group-hover:text-accent transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-dark/60 mt-1 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-dark/5 flex items-center justify-between text-xs font-bold">
                <span className="text-dark/70 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-accent" />
                  <span>{count} Videos</span>
                </span>

                <span className="text-accent group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  <span>Open</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
