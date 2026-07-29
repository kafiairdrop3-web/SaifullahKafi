import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import { INITIAL_SAMPLE_VIDEOS, INITIAL_SAMPLE_TAGS } from '../data/sampleData';

const VIDEOS_STORAGE_KEY = 'hsc_videos_v1';
const TAGS_STORAGE_KEY = 'hsc_tags_v1';

// Helper: Get videos from LocalStorage for Demo Mode
function getLocalVideos() {
  const saved = localStorage.getItem(VIDEOS_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_VIDEOS));
    return INITIAL_SAMPLE_VIDEOS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_SAMPLE_VIDEOS;
  }
}

// Helper: Save videos to LocalStorage for Demo Mode
function saveLocalVideos(videos) {
  localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos));
}

// Helper: Get tags from LocalStorage for Demo Mode
function getLocalTags() {
  const saved = localStorage.getItem(TAGS_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TAGS));
    return INITIAL_SAMPLE_TAGS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_SAMPLE_TAGS;
  }
}

// Helper: Save tags to LocalStorage for Demo Mode
function saveLocalTags(tags) {
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
}

/**
 * Clean and normalize any Telegram link input into 'CHANNEL_USERNAME/POST_ID'
 */
export function normalizeTelegramLink(input) {
  if (!input) return '';
  let clean = input.trim();
  clean = clean.replace(/^https?:\/\//i, '');
  clean = clean.replace(/^www\./i, '');
  clean = clean.replace(/^t\.me\//i, '');
  clean = clean.replace(/^telegram\.me\//i, '');
  clean = clean.replace(/^@/, '');
  // Remove trailing slashes or query params
  clean = clean.split('?')[0].replace(/\/$/, '');
  return clean;
}

/**
 * Ensure a tag exists in the tags collection/storage
 */
export async function ensureTagExists(subjectId, type, value) {
  if (!value || !value.trim()) return;
  const cleanVal = value.trim();

  if (isDemoMode) {
    const tags = getLocalTags();
    const exists = tags.some(t => t.subjectId === subjectId && t.type === type && t.value === cleanVal);
    if (!exists) {
      const newTag = {
        id: 'tag-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        subjectId,
        type,
        value: cleanVal
      };
      saveLocalTags([...tags, newTag]);
    }
    return;
  }

  // Firestore mode
  try {
    const q = query(
      collection(db, 'tags'),
      where('subjectId', '==', subjectId),
      where('type', '==', type),
      where('value', '==', cleanVal)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(collection(db, 'tags'), {
        subjectId,
        type,
        value: cleanVal
      });
    }
  } catch (err) {
    console.error('Error ensuring tag exists:', err);
  }
}

/**
 * Fetch all videos for a given subject
 */
export async function getVideosBySubject(subjectId) {
  if (isDemoMode) {
    const videos = getLocalVideos();
    return videos
      .filter(v => v.subjectId === subjectId)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  try {
    const q = query(collection(db, 'videos'), where('subjectId', '==', subjectId));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('Error fetching videos from Firestore:', err);
    return [];
  }
}

/**
 * Add a new video
 */
export async function addVideo(videoData) {
  const normalizedLink = normalizeTelegramLink(videoData.telegramPostLink);
  const data = {
    ...videoData,
    telegramPostLink: normalizedLink,
    createdAt: Date.now()
  };

  // Ensure tags exist for Course, Chapter, and Teacher
  await ensureTagExists(data.subjectId, 'course', data.courseName);
  await ensureTagExists(data.subjectId, 'chapter', data.chapterNumber);
  await ensureTagExists(data.subjectId, 'teacher', data.teacherName);

  if (isDemoMode) {
    const videos = getLocalVideos();
    const newVideo = { id: 'vid-' + Date.now(), ...data };
    saveLocalVideos([newVideo, ...videos]);
    return newVideo;
  }

  const docRef = await addDoc(collection(db, 'videos'), data);
  return { id: docRef.id, ...data };
}

/**
 * Update an existing video
 */
export async function updateVideo(id, videoData) {
  const normalizedLink = normalizeTelegramLink(videoData.telegramPostLink);
  const data = {
    ...videoData,
    telegramPostLink: normalizedLink
  };

  // Ensure tags exist for Course, Chapter, and Teacher
  await ensureTagExists(data.subjectId, 'course', data.courseName);
  await ensureTagExists(data.subjectId, 'chapter', data.chapterNumber);
  await ensureTagExists(data.subjectId, 'teacher', data.teacherName);

  if (isDemoMode) {
    const videos = getLocalVideos();
    const updated = videos.map(v => (v.id === id ? { ...v, ...data } : v));
    saveLocalVideos(updated);
    return { id, ...data };
  }

  const videoRef = doc(db, 'videos', id);
  await updateDoc(videoRef, data);
  return { id, ...data };
}

/**
 * Delete a video by ID
 */
export async function deleteVideo(id) {
  if (isDemoMode) {
    const videos = getLocalVideos();
    const filtered = videos.filter(v => v.id !== id);
    saveLocalVideos(filtered);
    return;
  }

  await deleteDoc(doc(db, 'videos', id));
}

/**
 * Fetch all tags for a subject (merging any tags present in videos)
 */
export async function getTagsBySubject(subjectId) {
  let tagsList = [];

  if (isDemoMode) {
    const tags = getLocalTags();
    tagsList = tags.filter(t => t.subjectId === subjectId);
  } else {
    try {
      const q = query(collection(db, 'tags'), where('subjectId', '==', subjectId));
      const snapshot = await getDocs(q);
      tagsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching tags from Firestore:', err);
    }
  }

  // Also extract any tags currently present in videos for this subject
  const videos = await getVideosBySubject(subjectId);
  const existingSet = new Set(tagsList.map(t => `${t.type}:${t.value}`));

  const additions = [];
  videos.forEach(v => {
    if (v.courseName && !existingSet.has(`course:${v.courseName}`)) {
      additions.push({ subjectId, type: 'course', value: v.courseName });
      existingSet.add(`course:${v.courseName}`);
    }
    if (v.chapterNumber && !existingSet.has(`chapter:${v.chapterNumber}`)) {
      additions.push({ subjectId, type: 'chapter', value: v.chapterNumber });
      existingSet.add(`chapter:${v.chapterNumber}`);
    }
    if (v.teacherName && !existingSet.has(`teacher:${v.teacherName}`)) {
      additions.push({ subjectId, type: 'teacher', value: v.teacherName });
      existingSet.add(`teacher:${v.teacherName}`);
    }
  });

  if (additions.length > 0) {
    if (isDemoMode) {
      const allTags = getLocalTags();
      const newLocal = additions.map((a, i) => ({
        id: 'tag-' + Date.now() + '-' + i,
        ...a
      }));
      saveLocalTags([...allTags, ...newLocal]);
      tagsList.push(...newLocal);
    } else {
      // In Firestore, create any missing tag entries
      for (const add of additions) {
        try {
          const ref = await addDoc(collection(db, 'tags'), add);
          tagsList.push({ id: ref.id, ...add });
        } catch (e) {
          console.error('Error adding missing tag:', e);
        }
      }
    }
  }

  return {
    course: tagsList.filter(t => t.type === 'course').map(t => t.value),
    chapter: tagsList.filter(t => t.type === 'chapter').map(t => t.value),
    teacher: tagsList.filter(t => t.type === 'teacher').map(t => t.value)
  };
}

/**
 * Rename a tag and update all videos that use it
 */
export async function renameTag(subjectId, type, oldVal, newVal) {
  if (!newVal || !newVal.trim()) return;
  const cleanNewVal = newVal.trim();

  if (isDemoMode) {
    // 1. Update tag in local tags
    const tags = getLocalTags();
    const updatedTags = tags.map(t => {
      if (t.subjectId === subjectId && t.type === type && t.value === oldVal) {
        return { ...t, value: cleanNewVal };
      }
      return t;
    });
    saveLocalTags(updatedTags);

    // 2. Update all matching videos
    const videos = getLocalVideos();
    const updatedVideos = videos.map(v => {
      if (v.subjectId !== subjectId) return v;
      if (type === 'course' && v.courseName === oldVal) {
        return { ...v, courseName: cleanNewVal };
      }
      if (type === 'chapter' && v.chapterNumber === oldVal) {
        return { ...v, chapterNumber: cleanNewVal };
      }
      if (type === 'teacher' && v.teacherName === oldVal) {
        return { ...v, teacherName: cleanNewVal };
      }
      return v;
    });
    saveLocalVideos(updatedVideos);
    return;
  }

  // Firestore rename using batch write
  try {
    const tagQuery = query(
      collection(db, 'tags'),
      where('subjectId', '==', subjectId),
      where('type', '==', type),
      where('value', '==', oldVal)
    );
    const tagSnap = await getDocs(tagQuery);
    const batch = writeBatch(db);

    tagSnap.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { value: cleanNewVal });
    });

    const videosQuery = query(
      collection(db, 'videos'),
      where('subjectId', '==', subjectId)
    );
    const videosSnap = await getDocs(videosQuery);
    videosSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      const updateObj = {};
      if (type === 'course' && data.courseName === oldVal) {
        updateObj.courseName = cleanNewVal;
      }
      if (type === 'chapter' && data.chapterNumber === oldVal) {
        updateObj.chapterNumber = cleanNewVal;
      }
      if (type === 'teacher' && data.teacherName === oldVal) {
        updateObj.teacherName = cleanNewVal;
      }
      if (Object.keys(updateObj).length > 0) {
        batch.update(docSnap.ref, updateObj);
      }
    });

    await batch.commit();
  } catch (err) {
    console.error('Error renaming tag in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a tag value
 */
export async function deleteTag(subjectId, type, value) {
  if (isDemoMode) {
    const tags = getLocalTags();
    const filtered = tags.filter(t => !(t.subjectId === subjectId && t.type === type && t.value === value));
    saveLocalTags(filtered);
    return;
  }

  try {
    const q = query(
      collection(db, 'tags'),
      where('subjectId', '==', subjectId),
      where('type', '==', type),
      where('value', '==', value)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error deleting tag in Firestore:', err);
    throw err;
  }
}

/**
 * Check if a tag is currently used by any videos
 */
export async function isTagInUse(subjectId, type, value) {
  const videos = await getVideosBySubject(subjectId);
  return videos.some(v => {
    if (type === 'course') return v.courseName === value;
    if (type === 'chapter') return v.chapterNumber === value;
    if (type === 'teacher') return v.teacherName === value;
    return false;
  });
}
