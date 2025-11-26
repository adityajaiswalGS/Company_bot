'use client';

import { supabase } from '@/lib/supabase';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../layout';

export default function AdminDashboard() {
  const { profile } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all users in this company
  useEffect(() => {
    if (profile?.company_id) {
      supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setUsers(data || []));
    }
  }, [profile]);

 const createUser = async () => {
  if (!email || !password || !fullName) return alert('Fill all fields');

  setLoading(true);

  // 1. Sign up the user normally (this works with anon key)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    alert('Error: ' + signUpError.message);
    setLoading(false);
    return;
  }

  // 2. If signUp worked, add their profile with correct company_id
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: signUpData.user.id,
      full_name: fullName,
      role: 'user',
      company_id: profile.company_id,
    });

  if (profileError) {
    alert('Profile error: ' + profileError.message);
  } else {
    alert('User created! They can now login.');
    setEmail('');
    setPassword('');
    setFullName('');
    setUsers(prev => [...prev, { 
      id: signUpData.user.id, 
      full_name: fullName, 
      role: 'user' 
    }]);
  }

  setLoading(false);
};

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold text-gray-800">
        Welcome, {profile.full_name || 'Admin'}
      </h1>

      {/* Create User Form */}
      <div className="mb-12 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">Add New User</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border p-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border p-4"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border p-4"
          />
        </div>
        <button
          onClick={createUser}
          disabled={loading}
          className="mt-6 rounded-lg bg-green-600 px-8 py-4 text-white font-bold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </div>

      {/* Users List */}
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">All Users ({users.length})</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {users.map(u => (
            <div key={u.id} className="rounded-lg border p-6">
              <p className="text-lg font-semibold">{u.full_name || 'No name'}</p>
              <p className="text-sm text-gray-600">{u.id}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {u.role.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}