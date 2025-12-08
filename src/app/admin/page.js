// src/app/admin/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../layout';
import { supabaseAdmin } from '@/lib/supabase';

export default function AdminDashboard() {
  const { profile } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (profile?.company_id) loadUsers();
  }, [profile]);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };



 const createUser = async () => {
  if (!email || !password || !fullName) {
    showMessage('All fields are required', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage('Invalid email', 'error');
    return;
  }
  if (password.length < 6) {
    showMessage('Password must be 6+ chars', 'error');
    return;
  }

  setLoading(true);
  showMessage('', '');

  try {
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        fullName,
        companyId: profile.company_id,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed');

    showMessage(`User "${fullName}" created successfully!`, 'success');
    setEmail('');
    setPassword('');
    setFullName('');
    loadUsers();

  } catch (err) {
    showMessage(err.message || 'Failed to create user', 'error');
  } finally {
    setLoading(false);
  }
};



  const showMessage = (text, type) => {
    setMessage({ text, type });
    if (text) setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  if (!profile) return <div className="p-8 text-center text-2xl">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="mb-10 text-5xl font-extrabold text-gray-800">
        Welcome, {'Admin'}
      </h1>

      {message.text && (
        <div
          className={`mb-8 p-5 rounded-xl text-center text-lg font-medium shadow-lg border-2 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-12 rounded-2xl bg-white p-10 shadow-2xl border border-gray-200">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">Add New User</h2>

        <div className="grid text-gray-800 grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
          />
        </div>

        <button
          onClick={createUser}
          disabled={loading}
          className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl rounded-xl shadow-lg disabled:opacity-60 transition transform hover:scale-105"
        >
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </div>

     
      {/* Users List */}
      <div className="rounded-2xl bg-white p-10 shadow-2xl border border-gray-200">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          All Users in Your Company ({users.length})
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold text-gray-800">{u.full_name || 'No Name'}</h3>
              <p className="text-sm text-gray-500 mt-1 truncate">{u.id}</p>

              <div className="mt-4">
                <span
                  className={`inline-block text-gray-800 px-4 py-2 rounded-full text-sm font-bold ${
                    u.role === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {u.role.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <p className="text-center text-gray-800 text-lg mt-10">No users yet. Create the first one above!</p>
        )}
      </div>
    </div>
  );
}