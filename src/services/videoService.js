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
 * Fetch all explicitly stored tags for a subject.
 */
export async function getTagsBySubject(subjectId) {
  let tagsList = [];

  if (isDemoMode) {
    tagsList = getLocalTags().filter(t => t.subjectId === subjectId);
  } else {
    try {
      const q = query(collection(db, 'tags'), where('subjectId', '==', subjectId));
      const snapshot = await getDocs(q);
      tagsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching tags from Firestore:', err);
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
 * Delete a tag value and clear it from every video that uses it.
 */
export async function deleteTag(subjectId, type, value) {
  const fieldByType = {
    course: 'courseName',
    chapter: 'chapterNumber',
    teacher: 'teacherName'
  };
  const videoField = fieldByType[type];

  if (!videoField) return;

  if (isDemoMode) {
    const tags = getLocalTags();
    saveLocalTags(tags.filter(t => !(t.subjectId === subjectId && t.type === type && t.value === value)));

    const videos = getLocalVideos();
    saveLocalVideos(videos.map(video => (
      video.subjectId === subjectId && video[videoField] === value
        ? { ...video, [videoField]: '' }
        : video
    )));
    return;
  }

  try {
    const tagQuery = query(
      collection(db, 'tags'),
      where('subjectId', '==', subjectId),
      where('type', '==', type),
      where('value', '==', value)
    );
    const tagSnap = await getDocs(tagQuery);
    const deleteBatch = writeBatch(db);
    tagSnap.docs.forEach(docSnap => deleteBatch.delete(docSnap.ref));
    await deleteBatch.commit();

    const videosQuery = query(
      collection(db, 'videos'),
      where('subjectId', '==', subjectId)
    );
    const videosSnap = await getDocs(videosQuery);
    const clearBatch = writeBatch(db);
    videosSnap.docs.forEach(docSnap => {
      if (docSnap.data()[videoField] === value) {
        clearBatch.update(docSnap.ref, { [videoField]: '' });
      }
    });
    await clearBatch.commit();
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

/**
 * Helper for non-coder user: Seed sample videos and tags into live Firestore database
 * so they can immediately test their connected Firebase project!
 */
export async function seedSampleDataToFirestore() {
  if (isDemoMode) {
    alert("You are in Demo Mode (LocalStorage). Sample data is already present!");
    return;
  }
  try {
    // 1. Add sample videos
    for (const vid of INITIAL_SAMPLE_VIDEOS) {
      const { id, ...data } = vid;
      await addDoc(collection(db, 'videos'), { ...data, createdAt: Date.now() });
    }
    // 2. Add sample tags
    for (const tag of INITIAL_SAMPLE_TAGS) {
      const { id, ...data } = tag;
      await addDoc(collection(db, 'tags'), data);
    }
    return true;
  } catch (err) {
    console.error('Error seeding sample data to Firestore:', err);
    throw err;
  }
}

