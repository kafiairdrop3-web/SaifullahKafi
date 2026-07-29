import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SUBJECTS_MAP } from '../constants/subjects';
import { getVideosBySubject, getTagsBySubject } from '../services/videoService';
import PillFilter from '../components/PillFilter';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  BookOpen, 
  Languages, 
  Cpu, 
  ArrowLeft, 
  PlusCircle, 
  Video, 
  FilterX 
} from 'lucide-react';

const iconMap = {
  Calculator: <Calculator className="w-7 h-7" />,
  Atom: <Atom className="w-7 h-7" />,
  FlaskConical: <FlaskConical className="w-7 h-7" />,
  Dna: <Dna className="w-7 h-7" />,
  BookOpen: <BookOpen className="w-7 h-7" />,
  Languages: <Languages className="w-7 h-7" />,
  Cpu: <Cpu className="w-7 h-7" />
};

export default function SubjectPage() {
  const { subjectId } = useParams();
  const subject = SUBJECTS_MAP[subjectId] || SUBJECTS_MAP['higher-math'];

  const [videos, setVideos] = useState([]);
  const [tags, setTags] = useState({ course: [], chapter: [], teacher: [] });
  const [loading, setLoading] = useState(true);

  // Selected pill filter states
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  // Active playing video for inline Modal
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    async function loadSubjectData() {
      setLoading(true);
      const [vids, tg] = await Promise.all([
        getVideosBySubject(subject.id),
        getTagsBySubject(subject.id)
      ]);
      setVideos(vids);
      setTags(tg);
      setSelectedCourses([]);
      setSelectedChapters([]);
      setSelectedTeachers([]);
      setActiveVideo(null);
      setLoading(false);
    }
    loadSubjectData();
  }, [subject.id]);

  // Toggle filter helper
  const toggleSelection = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleClearAll = () => {
    setSelectedCourses([]);
    setSelectedChapters([]);
    setSelectedTeachers([]);
  };

  // AND logic filtering across the active groups
  const filteredVideos = videos.filter((v) => {
    // 1. By Course
    if (selectedCourses.length > 0 && !selectedCourses.includes(v.courseName)) {
      return false;
    }
    // 2. By Chapter
    if (selectedChapters.length > 0 && !selectedChapters.includes(v.chapterNumber)) {
      return false;
    }
    // 3. By Teacher
    if (selectedTeachers.length > 0 && !selectedTeachers.includes(v.teacherName)) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Back button & Subject Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-white border border-dark/10 flex items-center justify-center text-dark hover:bg-dark/5 transition-all shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-pill ${subject.color}`}
            >
              {iconMap[subject.icon] || <span>{subject.number}</span>}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-dark">
                  {subject.name}
                </h1>
                <span className="text-xs font-bold text-dark/40">
                  #{subject.number}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-dark/60">
                {subject.description}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/admin?subject=${subject.id}`}
          className="px-4 py-2 rounded-full text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all shadow-pill flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Video to {subject.name}</span>
        </Link>
      </div>

      {/* Pill Filter Section (Section 4.2) */}
      <PillFilter
        tags={tags}
        selectedCourses={selectedCourses}
        selectedChapters={selectedChapters}
        selectedTeachers={selectedTeachers}
        onToggleCourse={(c) => toggleSelection(selectedCourses, setSelectedCourses, c)}
        onToggleChapter={(ch) => toggleSelection(selectedChapters, setSelectedChapters, ch)}
        onToggleTeacher={(t) => toggleSelection(selectedTeachers, setSelectedTeachers, t)}
        onClearAll={handleClearAll}
      />

      {/* Videos Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-dark">
            Available Class Videos
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-dark/10 text-dark">
            {filteredVideos.length} / {videos.length}
          </span>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-dark/60 font-semibold">
            Loading {subject.name} videos...
          </p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => (
            <VideoCard
              key={vid.id}
              video={vid}
              subject={subject}
              onSelect={(video) => setActiveVideo(video)}
            />
          ))}
        </div>
      ) : (
        /* Empty / No Matches State */
        <div className="bg-white rounded-3xl border border-dark/5 p-12 text-center max-w-md mx-auto space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-full bg-yellow/20 text-yellow-dark flex items-center justify-center mx-auto">
            <FilterX className="w-8 h-8 text-dark" />
          </div>
          <h3 className="text-lg font-bold text-dark">
            No videos match the selected filters
          </h3>
          <p className="text-xs text-dark/60 leading-relaxed">
            Try deselecting some of your active Course, Chapter, or Teacher filters, or add a new video from the Admin Panel.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleClearAll}
              className="px-5 py-2 rounded-full text-xs font-bold bg-dark text-white hover:bg-dark/80 transition-all shadow-pill"
            >
              Reset All Filters
            </button>
            <Link
              to={`/admin?subject=${subject.id}`}
              className="px-5 py-2 rounded-full text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all shadow-pill"
            >
              Add Video
            </Link>
          </div>
        </div>
      )}

      {/* Inline Video Player Modal (Section 4.2 & Section 5) */}
      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}
