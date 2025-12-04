// src/middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // This is FAST and reliable
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // 1. If user is logged in and hits /login → redirect to correct dashboard
  if (session && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const redirectTo = profile?.role === 'admin' ? '/admin' : '/chat';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // 2. Protect /admin
  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', req.url));
    }
  }

  // 3. Protect /chat
  if (pathname.startsWith('/chat') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 4. ROOT PATH (/) → always go to login if not logged in, or dashboard if logged in
  if (pathname === '/') {
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      const redirectTo = profile?.role === 'admin' ? '/admin' : '/chat';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/chat/:path*'],
};