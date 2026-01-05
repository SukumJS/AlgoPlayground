import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeSession, SESSION_COOKIE_NAME } from '@/lib/auth';

// ===========================================
// POST /api/auth/signout
// Sign out and clear session cookie
// ===========================================

export async function POST() {
  try {
    // Revoke the session
    await revokeSession();

    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
