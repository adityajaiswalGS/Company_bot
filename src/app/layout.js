// src/app/layout.js
'use client';

import './globals.css';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, createContext } from 'react';

export const AuthContext = createContext({});

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data || null);
      })
      .catch(() => {
        setProfile(null);
      });
  }, [user]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthContext.Provider value={{ user, profile, loading }}>
          {loading ? (
            <div className="flex h-screen items-center justify-center text-2xl font-medium text-gray-600">
              Loading...
            </div>
          ) : (
            children
          )}
        </AuthContext.Provider>
      </body>
    </html>
  );
}