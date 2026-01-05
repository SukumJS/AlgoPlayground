// Client-side Firebase (for use in client components)
export { auth, db, googleProvider } from './client';

// Note: Admin SDK should be imported directly from './admin' in server components
// to avoid including it in client bundles
