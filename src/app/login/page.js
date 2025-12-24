'use client';
// src/app/login/page.js

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// -----------------------------
// ZOD SCHEMA
// -----------------------------
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -----------------------------
  // React Hook Form
  // -----------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // -----------------------------
  // Auto-redirect if already logged in
  // -----------------------------
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        router.replace(profile?.role === 'admin' ? '/admin' : '/chat');
      }
    });
  }, [router]);

  // -----------------------------
  // Login Handler
  // -----------------------------
  const onSubmit = async (formValues) => {
    setLoading(true);
    setError('');

    const { email, password } = formValues;

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Multi-Company Chat RAG</h1>

        {error && (
          <p className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="w-full text-gray-800 px-5 py-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-300"
            />
            {errors.email && (
              <p className="text-red-600 mt-2 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password')}
              className="w-full text-gray-800 px-5 py-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-300"
            />
            {errors.password && (
              <p className="text-red-600 mt-2 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
