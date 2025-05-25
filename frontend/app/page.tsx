'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    // Check if user has a token
    if (auth.isAuthenticated()) {
      try {
        // Verify token is still valid
        await auth.getMe();
        router.push('/dashboard');
      } catch (error) {
        // Token is invalid, go to login
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setChecking(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return null;
}