import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { findOrCreateUser } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') || '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    try {
      const supabase = await createServerClient();

      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      // Get user data
      const { user } = data;

      if (user) {
        // Create or update user in our database
        await findOrCreateUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        });
      }

      // Redirect to the intended destination
      return NextResponse.redirect(`${origin}${redirectTo}`);
    } catch (err) {
      console.error('Callback error:', err);
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent('Authentication failed')}`
      );
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`);
}
