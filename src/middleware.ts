import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userStr = request.cookies.get('user')?.value;
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      // Invalid user data
    }
  }

  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  // Not logged in - redirect to login and store intended destination
  if (!token || !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (user.role !== 'admin') {
      // User trying to access admin - redirect to user dashboard
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // User routes
  if (pathname.startsWith('/user')) {
    if (user.role !== 'user') {
      // Admin trying to access user - redirect to admin scoreboard
      return NextResponse.redirect(new URL('/admin/scoreboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/admin/:path*',
    '/login',
    '/'
  ]
};
