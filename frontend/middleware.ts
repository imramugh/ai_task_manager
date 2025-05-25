import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // For now, we'll handle auth on the client side
  // In production, you'd want to verify JWT tokens here
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};