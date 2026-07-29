import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { defaultFirebaseConfig } from '../firebaseConfig';

const CUSTOM_CONFIG_KEY = 'hsc_firebase_config_custom';

export function getActiveFirebaseConfig() {
  try {
    const saved = localStorage.getItem(CUSTOM_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.apiKey !== 'YOUR_API_KEY') {
        return { config: parsed, isCustom: true };
      }
    }
  } catch (e) {
    console.error('Failed to read custom Firebase config from localStorage:', e);
  }
  return { config: defaultFirebaseConfig, isCustom: false };
}

export function saveCustomFirebaseConfig(newConfig) {
  localStorage.setItem(CUSTOM_CONFIG_KEY, JSON.stringify(newConfig));
  window.location.reload();
}

export function removeCustomFirebaseConfig() {
  localStorage.removeItem(CUSTOM_CONFIG_KEY);
  window.location.reload();
}

const { config } = getActiveFirebaseConfig();
export const isDemoMode = !config.apiKey || config.apiKey === 'YOUR_API_KEY';

let app = null;
let db = null;
let auth = null;

if (!isDemoMode) {
  try {
    app = !getApps().length ? initializeApp(config) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.error('Firebase initialization failed:', err);
  }
}

export { app, db, auth };
