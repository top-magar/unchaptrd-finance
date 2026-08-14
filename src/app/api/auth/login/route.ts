import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const appPassword = process.env.APP_PASSWORD || 'unchaptrd2026';

    if (password === appPassword) {
      // Create session
      const sessionData = { user: 'admin', role: 'admin' };
      const session = await encrypt(sessionData);

      const response = NextResponse.json({ success: true });
      response.cookies.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
