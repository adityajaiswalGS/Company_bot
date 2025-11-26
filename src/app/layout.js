'use client';

import './globals.css';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, createContext } from 'react';

// Context to share user & profile everywhere
export const AuthContext = createContext({});

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes (login, logout, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // Fetch profile when user is logged in
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) setProfile(data);
        });
    } else {
      setProfile(null);
    }
  }, [user]);

  if (loading) {
    return (
      <html lang="en">
        <body>
          <div className="flex h-screen items-center justify-center text-2xl">
            Loading...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthContext.Provider value={{ user, profile }}>
          {children}
        </AuthContext.Provider>
      </body>
    </html>
  );
}