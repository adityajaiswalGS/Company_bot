'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else router.push('/');
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert('Account created! You can now login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Welcome Back
        </h1>
       <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 
             text-gray-800 placeholder-gray-500 bg-white 
             focus:border-blue-500 focus:outline-none"
/>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 
             text-gray-800 placeholder-gray-500 bg-white 
             focus:border-blue-500 focus:outline-none"
/>

        <div className="flex gap-4">
          <button
            onClick={signIn}
            className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Login
          </button>
          <button
            onClick={signUp}
            className="flex-1 rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}