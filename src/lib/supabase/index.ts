// Browser client - for use in client components
export { createClient as createBrowserClient, getSupabaseBrowserClient } from './client';

// Server client - for use in server components and API routes
export { createClient as createServerClient, getUser, getSession } from './server';
