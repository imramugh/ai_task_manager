'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    if (auth.isAuthenticated()) {
      // Verify the token is still valid
      auth.getMe()
        .then(() => {
          router.push('/dashboard');
        })
        .catch(() => {
          // Token is invalid, redirect to login
          router.push('/login');
        });
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}