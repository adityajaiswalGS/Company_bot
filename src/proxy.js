import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Change to 'export default' for Next.js 16 compatibility
export default async function proxy(req) { 
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return res;
  }

  // ... rest of your existing logic ...

  return res;
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/chat'],
};