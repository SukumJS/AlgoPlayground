import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { findOrCreateUser, getUserById } from '@/lib/db';

// Cookie name for storing the Firebase session
export const SESSION_COOKIE_NAME = 'firebase-session';

/**
 * Verify the session cookie and get the decoded token
 */
async function verifySessionCookie() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    // Verify the session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

/**
 * Get the current authenticated user for server components
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const decodedToken = await verifySessionCookie();

  if (!decodedToken) {
    return null;
  }

  // Get or create user in our database
  const user = await findOrCreateUser({
    id: decodedToken.uid,
    email: decodedToken.email || '',
    name: decodedToken.name || 'User',
    avatarUrl: decodedToken.picture || null,
  });

  return user;
}

/**
 * Require authentication for server components
 * Redirects to login if not authenticated
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = redirectTo
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login';
    redirect(loginUrl);
  }

  return user;
}

/**
 * Get the current user with their progress data
 */
export async function getCurrentUserWithProgress() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const userWithProgress = await getUserById(user.id);
  return userWithProgress;
}

/**
 * Create a session cookie from an ID token
 * This should be called from an API route after client-side sign in
 */
export async function createSessionCookie(idToken: string) {
  // Create session cookie that expires in 5 days
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
  
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  return sessionCookie;
}

/**
 * Revoke the session cookie
 */
export async function revokeSession() {
  try {
    const decodedToken = await verifySessionCookie();
    
    if (decodedToken) {
      // Revoke all refresh tokens for the user
      await adminAuth.revokeRefreshTokens(decodedToken.uid);
    }
  } catch (error) {
    console.error('Error revoking session:', error);
  }
}
