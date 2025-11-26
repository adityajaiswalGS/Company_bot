'use client';

import { useContext, useEffect } from 'react';
import { AuthContext } from './layout';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { profile } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!profile) return;

    if (profile.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/chat');
    }
  }, [profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-2xl">
      Redirecting...
    </div>
  );
}