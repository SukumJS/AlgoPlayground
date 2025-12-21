import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { getUserById, findOrCreateUser } from '@/lib/db';

/**
 * Get the current authenticated user for server components
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabaseUser = await getUser();

  if (!supabaseUser) {
    return null;
  }

  // Get or create user in our database
  const user = await findOrCreateUser({
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name:
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      'User',
    avatarUrl:
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture,
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
