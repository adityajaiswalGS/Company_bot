// src/app/admin/layout.js
'use client';

import { useContext } from 'react';
import { AuthContext } from '../layout';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }) {
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOP BAR */}
      <header className="h-16 bg-white shadow-md border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 left-0 right-0 z-50">
        <h1 className="text-2xl font-bold text-indigo-700">Admin Panel</h1>
        <div className="flex items-center gap-6">
          <span className="text-gray-700 font-medium">
            Hello, {profile?.full_name || 'Admin'}
          </span>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* SIDEBAR */}
        <aside className="w-72 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white shadow-2xl">
          <nav className="mt-10 px-6 space-y-3">
            <a href="/admin" className={`block py-4 px-6 rounded-xl text-lg font-medium transition-all ${pathname === '/admin' ? 'bg-white text-indigo-900 shadow-xl' : 'hover:bg-indigo-800'}`}>
              Dashboard
            </a>
            <a 
  href="/admin/documents" 
  className={`block py-4 px-6 rounded-xl text-lg font-medium transition-all ${
    pathname === '/admin/documents' ? 'bg-white text-indigo-900 shadow-xl' : 'hover:bg-indigo-800'
  }`}
>
  Documents
</a>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-10 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}