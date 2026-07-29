import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isDemoMode, saveCustomFirebaseConfig, removeCustomFirebaseConfig, getActiveFirebaseConfig } from '../services/firebase';
import { 
  getVideosBySubject, 
  addVideo, 
  updateVideo, 
  deleteVideo, 
  getTagsBySubject, 
  renameTag, 
  deleteTag, 
  isTagInUse 
} from '../services/videoService';
import { SUBJECTS, SUBJECTS_MAP } from '../constants/subjects';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  Video, 
  Tag, 
  Shield, 
  Lock, 
  LogOut, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  BookOpen,
  Layers,
  User,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Database
} from 'lucide-react';

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'videos';
  const initialSub = searchParams.get('subject') || 'higher-math';

  const [activeTab, setActiveTab] = useState(initialTab); // 'videos' | 'tags' | 'settings'
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSub);

  // Authentication states
  const [user, setUser] = useState(null);
  const [demoLoggedIn, setDemoLoggedIn] = useState(isDemoMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data states
  const [videos, setVideos] = useState([]);
  const [tags, setTags] = useState({ course: [], chapter: [], teacher: [] });
  const [loadingData, setLoadingData] = useState(true);

  // Modal / Form state for Add/Edit Video
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: selectedSubjectId,
    title: '',
    telegramPostLink: '',
    courseName: '',
    courseInput: '',
    chapterNumber: '',
    chapterInput: '',
    teacherName: '',
    teacherInput: ''
  });
  const [savingVideo, setSavingVideo] = useState(false);

  // Tag Rename modal state
  const [renameModal, setRenameModal] = useState({
    open: false,
    type: '', // 'course' | 'chapter' | 'teacher'
    oldValue: '',
    newValue: '',
    error: ''
  });

  // Firebase Custom Config state
  const { config: currentConfig, isCustom } = getActiveFirebaseConfig();
  const [customConfig, setCustomConfig] = useState({
    apiKey: currentConfig.apiKey || '',
    authDomain: currentConfig.authDomain || '',
    projectId: currentConfig.projectId || '',
    storageBucket: currentConfig.storageBucket || '',
    messagingSenderId: currentConfig.messagingSenderId || '',
    appId: currentConfig.appId || ''
  });

  // Auth state listener for Firebase
  useEffect(() => {
    if (isDemoMode || !auth) {
      setDemoLoggedIn(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Reload data when subject changes
  const loadData = async () => {
    setLoadingData(true);
    const [vids, tg] = await Promise.all([
      getVideosBySubject(selectedSubjectId),
      getTagsBySubject(selectedSubjectId)
    ]);
    setVideos(vids);
    setTags(tg);
    setLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedSubjectId]);

  // Handle Firebase Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isDemoMode && auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  // Open Add Video Modal
  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setFormData({
      subjectId: selectedSubjectId,
      title: '',
      telegramPostLink: '',
      courseName: tags.course[0] || '',
      courseInput: '',
      chapterNumber: tags.chapter[0] || '',
      chapterInput: '',
      teacherName: tags.teacher[0] || '',
      teacherInput: ''
    });
    setShowVideoModal(true);
  };

  // Open Edit Video Modal
  const handleOpenEditVideo = (video) => {
    setEditingVideo(video);
    setFormData({
      subjectId: video.subjectId || selectedSubjectId,
      title: video.title || '',
      telegramPostLink: video.telegramPostLink || '',
      courseName: video.courseName || '',
      courseInput: '',
      chapterNumber: video.chapterNumber || '',
      chapterInput: '',
      teacherName: video.teacherName || '',
      teacherInput: ''
    });
    setShowVideoModal(true);
  };

  // Submit Add / Edit Video
  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setSavingVideo(true);

    const finalCourse = formData.courseInput.trim() || formData.courseName;
    const finalChapter = formData.chapterInput.trim() || formData.chapterNumber;
    const finalTeacher = formData.teacherInput.trim() || formData.teacherName;

    if (!formData.title.trim()) {
      alert('Please enter a video title');
      setSavingVideo(false);
      return;
    }

    const payload = {
      subjectId: formData.subjectId,
      title: formData.title.trim(),
      telegramPostLink: formData.telegramPostLink.trim(),
      courseName: finalCourse,
      chapterNumber: finalChapter,
      teacherName: finalTeacher
    };

    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, payload);
      } else {
        await addVideo(payload);
      }
      setShowVideoModal(false);
      await loadData();
    } catch (err) {
      alert('Error saving video: ' + err.message);
    } finally {
      setSavingVideo(false);
    }
  };

  // Delete Video Handler
  const handleDeleteVideo = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    await deleteVideo(id);
    await loadData();
  };

  // Rename Tag Submit Handler
  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    const { type, oldValue, newValue } = renameModal;
    if (!newValue.trim() || newValue.trim() === oldValue) {
      setRenameModal({ ...renameModal, open: false });
      return;
    }

    try {
      await renameTag(selectedSubjectId, type, oldValue, newValue.trim());
      setRenameModal({ open: false, type: '', oldValue: '', newValue: '', error: '' });
      await loadData();
    } catch (err) {
      setRenameModal({ ...renameModal, error: 'Failed to rename tag: ' + err.message });
    }
  };

  // Delete Tag Handler with Confirmation / Check
  const handleDeleteTag = async (type, val) => {
    const inUse = await isTagInUse(selectedSubjectId, type, val);
    if (inUse) {
      if (!window.confirm(`Warning: The tag "${val}" is currently used by one or more videos! Do you still want to delete it?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Delete tag "${val}"?`)) {
        return;
      }
    }

    try {
      await deleteTag(selectedSubjectId, type, val);
      await loadData();
    } catch (err) {
      alert('Error deleting tag: ' + err.message);
    }
  };

  // Save Custom Firebase Config
  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (!customConfig.apiKey || customConfig.apiKey === 'YOUR_API_KEY') {
      alert('Please provide your real Firebase API Key and Project ID');
      return;
    }
    saveCustomFirebaseConfig(customConfig);
  };

  // --------------------------------------------------------------------------
  // LOGIN SCREEN (If using Firebase and not logged in)
  // --------------------------------------------------------------------------
  if (!isDemoMode && !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-dark/10 p-8 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center mx-auto shadow-pill">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-dark">Admin Panel Login</h1>
            <p className="text-xs text-dark/60">
              Sign in with your Firebase Authentication email and password.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-accent text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-full bg-accent hover:bg-accent/90 text-white text-sm font-bold shadow-pill transition-all"
            >
              {authLoading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div className="pt-4 border-t border-dark/5 text-center">
            <Link to="/" className="text-xs font-bold text-dark/60 hover:text-dark">
              ← Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ADMIN DASHBOARD
  // --------------------------------------------------------------------------
  const currentSubject = SUBJECTS_MAP[selectedSubjectId] || SUBJECTS[0];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner / Demo Mode Notice */}
      {isDemoMode && (
        <div className="bg-yellow/20 border border-yellow-dark/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow text-dark flex items-center justify-center shrink-0 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-dark">
                Demo Admin Mode (Sample Data Active)
              </h3>
              <p className="text-xs text-dark/70">
                You can add, edit, and delete videos and rename tags freely right now. To connect a live Firebase project, check the <b>Firebase Settings</b> tab.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-4 py-2 rounded-full text-xs font-bold bg-dark text-white hover:bg-dark/80 transition-all shrink-0 shadow-pill"
          >
            Connect Firebase
          </button>
        </div>
      )}

      {/* Header & Tabs bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-dark/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark">
              HSC Admin Dashboard
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple/20 text-dark">
              {isDemoMode ? 'Offline / LocalStorage' : 'Live Firestore'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-dark/60">
            Manage your HSC class videos, filter tags, and website configuration without editing code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Manage Videos */}
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-pill ${
              activeTab === 'videos'
                ? 'bg-accent text-white scale-105'
                : 'bg-white text-dark/80 border border-dark/10 hover:bg-dark/5'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Manage Videos</span>
          </button>

          {/* Tab 2: Manage Tags */}
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-pill ${
              activeTab === 'tags'
                ? 'bg-purple text-dark scale-105 font-bold'
                : 'bg-white text-dark/80 border border-dark/10 hover:bg-dark/5'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage Tags</span>
          </button>

          {/* Tab 3: Firebase Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-pill ${
              activeTab === 'settings'
                ? 'bg-dark text-white scale-105'
                : 'bg-white text-dark/80 border border-dark/10 hover:bg-dark/5'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Settings</span>
          </button>

          {/* Logout if authenticated */}
          {!isDemoMode && user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-dark/10 hover:bg-accent hover:text-white text-dark transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Selector for Videos & Tags Tabs */}
      {(activeTab === 'videos' || activeTab === 'tags') && (
        <div className="bg-white rounded-3xl border border-dark/5 p-4 sm:p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-dark/60">
              Select Subject:
            </span>
            <span className="text-sm font-bold text-dark">
              {currentSubject.name} ({videos.length} videos)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedSubjectId === sub.id
                    ? 'bg-dark text-white shadow-pill'
                    : 'bg-offwhite text-dark/70 hover:bg-dark/5'
                }`}
              >
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 1: MANAGE VIDEOS (Section 4.4 A)                                   */}
      {/* ====================================================================== */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-dark">
                {currentSubject.name} — Class Videos List
              </h2>
              <p className="text-xs text-dark/60">
                Click "+ Add New Video" to insert a class from Telegram. Use Edit or Delete on any row.
              </p>
            </div>

            <button
              onClick={handleOpenAddVideo}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all shadow-pill flex items-center gap-2 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Video</span>
            </button>
          </div>

          {/* Videos Table */}
          <div className="bg-white rounded-3xl border border-dark/5 overflow-hidden shadow-card">
            {loadingData ? (
              <div className="py-16 text-center text-sm text-dark/60">
                Loading videos...
              </div>
            ) : videos.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Video className="w-10 h-10 text-dark/30 mx-auto" />
                <p className="text-sm font-bold text-dark">
                  No videos added to {currentSubject.name} yet
                </p>
                <button
                  onClick={handleOpenAddVideo}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-accent text-white"
                >
                  + Add First Video
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark/5 bg-offwhite text-dark/60 text-xs uppercase tracking-wider font-bold">
                      <th className="py-4 px-5">Title</th>
                      <th className="py-4 px-5">Course</th>
                      <th className="py-4 px-5">Chapter</th>
                      <th className="py-4 px-5">Teacher</th>
                      <th className="py-4 px-5">Telegram Link</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark/5 text-sm">
                    {videos.map((v) => (
                      <tr key={v.id} className="hover:bg-dark/[0.02] transition-colors">
                        <td className="py-4 px-5 font-bold text-dark max-w-xs">
                          {v.title}
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow/40 text-dark">
                            {v.courseName || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple/30 text-dark">
                            {v.chapterNumber || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-dark/80 font-medium">
                          {v.teacherName || '—'}
                        </td>
                        <td className="py-4 px-5">
                          <code className="text-xs bg-offwhite px-2 py-1 rounded-lg text-dark/80 border border-dark/5">
                            {v.telegramPostLink}
                          </code>
                        </td>
                        <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditVideo(v)}
                            className="p-2 rounded-xl bg-dark/5 hover:bg-dark/10 text-dark transition-all"
                            title="Edit Video"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(v.id, v.title)}
                            className="p-2 rounded-xl bg-accent/15 hover:bg-accent text-accent hover:text-white transition-all"
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: MANAGE TAGS (Section 4.4 B)                                     */}
      {/* ====================================================================== */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-dark">
              Manage Filter Tags for {currentSubject.name}
            </h2>
            <p className="text-xs text-dark/60">
              Rename any tag to instantly fix typos across all existing videos. Delete unused tags.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course Tags */}
            <div className="bg-white rounded-3xl border border-dark/5 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dark/5">
                <div className="flex items-center gap-2 font-bold text-sm text-dark">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span>Course Names ({tags.course.length})</span>
                </div>
              </div>
              <div className="space-y-2">
                {tags.course.map((c) => (
                  <div
                    key={c}
                    className="flex items-center justify-between p-3 rounded-2xl bg-offwhite border border-dark/5 group"
                  >
                    <span className="text-xs font-bold text-dark">{c}</span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() =>
                          setRenameModal({
                            open: true,
                            type: 'course',
                            oldValue: c,
                            newValue: c,
                            error: ''
                          })
                        }
                        className="p-1.5 rounded-lg bg-dark/5 hover:bg-dark text-dark hover:text-white transition-all"
                        title="Rename Course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag('course', c)}
                        className="p-1.5 rounded-lg bg-accent/15 hover:bg-accent text-accent hover:text-white transition-all"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {tags.course.length === 0 && (
                  <p className="text-xs text-dark/40 italic">No course tags.</p>
                )}
              </div>
            </div>

            {/* Chapter Tags */}
            <div className="bg-white rounded-3xl border border-dark/5 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dark/5">
                <div className="flex items-center gap-2 font-bold text-sm text-dark">
                  <Layers className="w-4 h-4 text-purple-dark" />
                  <span>Chapter Names ({tags.chapter.length})</span>
                </div>
              </div>
              <div className="space-y-2">
                {tags.chapter.map((ch) => (
                  <div
                    key={ch}
                    className="flex items-center justify-between p-3 rounded-2xl bg-offwhite border border-dark/5 group"
                  >
                    <span className="text-xs font-bold text-dark">{ch}</span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() =>
                          setRenameModal({
                            open: true,
                            type: 'chapter',
                            oldValue: ch,
                            newValue: ch,
                            error: ''
                          })
                        }
                        className="p-1.5 rounded-lg bg-dark/5 hover:bg-dark text-dark hover:text-white transition-all"
                        title="Rename Chapter"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag('chapter', ch)}
                        className="p-1.5 rounded-lg bg-accent/15 hover:bg-accent text-accent hover:text-white transition-all"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {tags.chapter.length === 0 && (
                  <p className="text-xs text-dark/40 italic">No chapter tags.</p>
                )}
              </div>
            </div>

            {/* Teacher Tags */}
            <div className="bg-white rounded-3xl border border-dark/5 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dark/5">
                <div className="flex items-center gap-2 font-bold text-sm text-dark">
                  <User className="w-4 h-4 text-dark/70" />
                  <span>Teacher Names ({tags.teacher.length})</span>
                </div>
              </div>
              <div className="space-y-2">
                {tags.teacher.map((t) => (
                  <div
                    key={t}
                    className="flex items-center justify-between p-3 rounded-2xl bg-offwhite border border-dark/5 group"
                  >
                    <span className="text-xs font-bold text-dark">{t}</span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() =>
                          setRenameModal({
                            open: true,
                            type: 'teacher',
                            oldValue: t,
                            newValue: t,
                            error: ''
                          })
                        }
                        className="p-1.5 rounded-lg bg-dark/5 hover:bg-dark text-dark hover:text-white transition-all"
                        title="Rename Teacher"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag('teacher', t)}
                        className="p-1.5 rounded-lg bg-accent/15 hover:bg-accent text-accent hover:text-white transition-all"
                        title="Delete Teacher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {tags.teacher.length === 0 && (
                  <p className="text-xs text-dark/40 italic">No teacher tags.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 3: FIREBASE SETTINGS & SETUP GUIDE FOR NON-CODER                 */}
      {/* ====================================================================== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Custom Config Paste Form */}
          <div className="bg-white rounded-3xl border border-dark/5 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent" />
                  <span>Firebase Connection Settings</span>
                </h2>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isCustom
                      ? 'bg-purple/20 text-dark'
                      : 'bg-yellow/20 text-dark'
                  }`}
                >
                  {isCustom ? 'Custom Config Saved' : 'Default / Demo Mode'}
                </span>
              </div>
              <p className="text-xs text-dark/60 mt-1">
                Paste your Firebase Project keys below. You never have to edit code or JSON files directly!
              </p>
            </div>

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  required
                  value={customConfig.apiKey}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, apiKey: e.target.value })
                  }
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-xs font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  required
                  value={customConfig.authDomain}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, authDomain: e.target.value })
                  }
                  placeholder="your-project.firebaseapp.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-xs font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  required
                  value={customConfig.projectId}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, projectId: e.target.value })
                  }
                  placeholder="your-project-id"
                  className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-xs font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Storage Bucket
                  </label>
                  <input
                    type="text"
                    value={customConfig.storageBucket}
                    onChange={(e) =>
                      setCustomConfig({
                        ...customConfig,
                        storageBucket: e.target.value
                      })
                    }
                    placeholder="your-project.appspot.com"
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={customConfig.appId}
                    onChange={(e) =>
                      setCustomConfig({ ...customConfig, appId: e.target.value })
                    }
                    placeholder="1:123456789:web:abcdef..."
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all shadow-pill"
                >
                  Save & Connect Firebase
                </button>

                {isCustom && (
                  <button
                    type="button"
                    onClick={removeCustomFirebaseConfig}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-dark/10 hover:bg-dark text-dark hover:text-white transition-all"
                  >
                    Reset to Demo Mode
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Plain Language Instructions (Section 9) */}
          <div className="bg-white rounded-3xl border border-dark/5 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-dark" />
                <span>How to Setup Your Website (No Coding)</span>
              </h3>
              <p className="text-xs text-dark/60 mt-1">
                Follow these 4 simple numbered steps to connect Firebase and Telegram:
              </p>
            </div>

            <ol className="space-y-4 text-xs text-dark/80 leading-relaxed list-decimal list-inside">
              <li className="p-3 rounded-2xl bg-offwhite border border-dark/5">
                <b>Create Free Firebase Project:</b> Go to{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline font-bold"
                >
                  firebase.google.com
                </a>
                , click "Create a project", name it "HSC-Study-Hub", and click continue.
              </li>
              <li className="p-3 rounded-2xl bg-offwhite border border-dark/5">
                <b>Enable Firestore & Authentication:</b> Inside your Firebase console, click <b>Build → Firestore Database → Create Database</b> (start in Production mode). Next, click <b>Build → Authentication → Get Started</b>, enable <b>Email/Password</b>, and click "Add User" to create your Admin email and password.
              </li>
              <li className="p-3 rounded-2xl bg-offwhite border border-dark/5">
                <b>Copy Your Keys:</b> Click the Gear icon ⚙️ → <b>Project Settings → General → Your Apps</b>. Click the Web icon <code>&lt;/&gt;</code>, copy the API Key and Project ID, and paste them into the form on the left!
              </li>
              <li className="p-3 rounded-2xl bg-offwhite border border-dark/5">
                <b>Telegram Channel Setup:</b> Create a <b>Public Telegram Channel</b> (e.g. <code>t.me/my_hsc_classes_2026</code>) and post your videos there. When adding a video here, just paste the post link like <code>my_hsc_classes_2026/10</code>!
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* ADD / EDIT VIDEO MODAL (Section 4.4 A)                                 */}
      {/* ====================================================================== */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-dark/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-dark/10 max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-5 sm:p-6 bg-offwhite border-b border-dark/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">
                {editingVideo ? 'Edit Class Video' : 'Add New Class Video'}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-9 h-9 rounded-full bg-dark/5 hover:bg-dark text-dark hover:text-white flex items-center justify-center transition-all"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-6 overflow-y-auto space-y-4">
              {/* 1. Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Subject
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-sm font-semibold focus:outline-none focus:border-accent"
                >
                  {SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Video Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Chemical Change — Lecture 1"
                  className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              {/* 3. Telegram Post Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                  Telegram Post Link * (CHANNEL_USERNAME/POST_ID)
                </label>
                <input
                  type="text"
                  required
                  value={formData.telegramPostLink}
                  onChange={(e) =>
                    setFormData({ ...formData, telegramPostLink: e.target.value })
                  }
                  placeholder="e.g. ACS_HSC_26/102 or https://t.me/ACS_HSC_26/102"
                  className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-sm font-mono focus:outline-none focus:border-accent"
                />
                <p className="text-[11px] text-dark/50 mt-1">
                  You can paste the full Telegram link; we will automatically format it for embedding.
                </p>
              </div>

              {/* 4. Course Tag (Select or type new) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-dark/5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Course Name (Existing)
                  </label>
                  <select
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value, courseInput: '' })
                    }
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="">-- Select Course --</option>
                    {tags.course.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-accent mb-1">
                    Or Type New Course Name
                  </label>
                  <input
                    type="text"
                    value={formData.courseInput}
                    onChange={(e) =>
                      setFormData({ ...formData, courseInput: e.target.value })
                    }
                    placeholder="e.g. Aloron 2026"
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* 5. Chapter Tag (Select or type new) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Chapter Number (Existing)
                  </label>
                  <select
                    value={formData.chapterNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, chapterNumber: e.target.value, chapterInput: '' })
                    }
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="">-- Select Chapter --</option>
                    {tags.chapter.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-dark mb-1">
                    Or Type New Chapter
                  </label>
                  <input
                    type="text"
                    value={formData.chapterInput}
                    onChange={(e) =>
                      setFormData({ ...formData, chapterInput: e.target.value })
                    }
                    placeholder="e.g. Chapter 4"
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* 6. Teacher Tag (Select or type new) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                    Teacher Name (Existing)
                  </label>
                  <select
                    value={formData.teacherName}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherName: e.target.value, teacherInput: '' })
                    }
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="">-- Select Teacher --</option>
                    {tags.teacher.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-1">
                    Or Type New Teacher
                  </label>
                  <input
                    type="text"
                    value={formData.teacherInput}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherInput: e.target.value })
                    }
                    placeholder="e.g. Mostafa Pahlovi"
                    className="w-full px-3.5 py-2 rounded-2xl bg-offwhite border border-dark/10 text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-dark/5">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-dark/10 hover:bg-dark text-dark hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVideo}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-pill transition-all"
                >
                  {savingVideo ? 'Saving...' : editingVideo ? 'Update Video' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* RENAME TAG MODAL (Section 4.4 B)                                       */}
      {/* ====================================================================== */}
      {renameModal.open && (
        <div className="fixed inset-0 z-50 bg-dark/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-dark/10 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-dark">
              Rename {renameModal.type} Tag
            </h3>
            <p className="text-xs text-dark/60">
              Renaming <b>"{renameModal.oldValue}"</b> will automatically update all existing videos using this tag!
            </p>

            {renameModal.error && (
              <p className="text-xs text-accent font-bold">{renameModal.error}</p>
            )}

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark/70 mb-1">
                  New Tag Name
                </label>
                <input
                  type="text"
                  required
                  value={renameModal.newValue}
                  onChange={(e) =>
                    setRenameModal({ ...renameModal, newValue: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-offwhite border border-dark/10 text-sm font-semibold focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setRenameModal({ open: false, type: '', oldValue: '', newValue: '', error: '' })
                  }
                  className="px-4 py-2 rounded-full text-xs font-bold bg-dark/10 hover:bg-dark text-dark hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all shadow-pill"
                >
                  Rename Across All Videos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
