import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  
  const path = request.nextUrl.pathname;
  // Let static assets and API auth routes pass through
  const isPublicPath = path === '/login' || path.startsWith('/_next') || path.startsWith('/api/auth') || path.startsWith('/favicon.ico');

  if (!isPublicPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      await decrypt(session);
    } catch (error) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // If trying to access /login while authenticated, redirect to /
  if (path === '/login' && session) {
    try {
      await decrypt(session);
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Allow them to stay on login page if token is invalid
      const response = NextResponse.next();
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
