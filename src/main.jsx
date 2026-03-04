import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ensureAuth } from './firebase/auth.js';
import './index.css';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
];

const missingVars = requiredEnvVars.filter(k => !import.meta.env[k]);

if (missingVars.length > 0) {
  document.getElementById('root').innerHTML = `
    <div style="min-height:100vh;background:#0f0020;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e9d5ff;font-family:Arial,sans-serif;padding:24px;text-align:center;direction:rtl">
      <h1 style="color:#a855f7;font-size:2rem;margin-bottom:1rem">⚙️ הגדרות Firebase חסרות</h1>
      <p style="color:#7c3aed;margin-bottom:1rem">הוסף/י את משתני הסביבה של Firebase לקובץ <code>.env.local</code></p>
      <pre style="background:#1a0533;padding:16px;border-radius:8px;border:1px solid #7c3aed;text-align:left;direction:ltr;font-size:13px;color:#c4b5fd">VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...</pre>
    </div>
  `;
} else {
  ensureAuth()
    .then(() => {
      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    })
    .catch((err) => {
      document.getElementById('root').innerHTML = `
        <div style="min-height:100vh;background:#0f0020;display:flex;align-items:center;justify-content:center;color:#fca5a5;font-family:Arial;text-align:center;padding:24px;direction:rtl">
          <div>
            <p style="font-size:1.2rem">שגיאת אימות Firebase</p>
            <p style="color:#7c3aed;font-size:14px;margin-top:8px">${err.message}</p>
            <p style="color:#6d28d9;font-size:13px;margin-top:8px">בדוק/י שאימות אנונימי מופעל ב-Firebase Console</p>
          </div>
        </div>
      `;
    });
}
