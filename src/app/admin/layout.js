'use client';

import { useContext } from 'react';
import { AuthContext } from '../layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { profile } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.push('/chat');
    }
  }, [profile, router]);

  if (!profile || profile.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center text-2xl">Access Denied</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-6 text-2xl font-bold">Admin Panel</div>
        <nav className="mt-10">
          <a href="/admin" className="block py-3 px-6 bg-indigo-900">Users</a>
          <a href="/admin/documents" className="block py-3 px-6 hover:bg-indigo-700">Documents</a>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            className="mt-20 block w-full py-3 px-6 text-left hover:bg-red-700"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {children}
      </div>
    </div>
  );
}