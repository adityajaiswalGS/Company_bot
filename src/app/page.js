'use client';

import { useContext, useEffect } from 'react';
import { AuthContext } from './layout';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { profile } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!profile) return;

    if (profile.is_super_admin) {
      router.push('/super-admin');
    } else if (profile.role === 'admin') {
      router.push('/admin');
    } else if (profile.role === 'user') {
      router.push('/chat');
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-2xl">Yeh hai landing pagee</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-2xl">Redirecting you to your dashboard...</p>
    </div>
  );
}