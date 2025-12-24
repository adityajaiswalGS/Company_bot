'use client';
// src/components/AuthProvider.js

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setProfile, clearProfile } from '@/store/authSlice';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial load
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, role, company_id')
          .eq('id', user.id)
          .single();
        dispatch(setProfile(profile || null));
      } else {
        dispatch(clearProfile());
      }
    };

    loadProfile();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, role, company_id')
          .eq('id', session.user.id)
          .single();
        dispatch(setProfile(profile || null));
      } else if (event === 'SIGNED_OUT') {
        dispatch(clearProfile());
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}