'use client';
// src/app/admin/dashboard/page.js

import { supabase } from '@/lib/supabase';
import { useContext, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import CreateUserForm from './components/CreateUserForm';
import UserList from './components/UserList';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';

const profile = useSelector((state) => state.auth.profile);
const companyId = profile?.company_id;



const UserSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be 6+ chars').required('Password is required'),
  fullName: Yup.string().min(2, 'Too short').required('Full name is required'),
});

const PAGE_SIZE = 6;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (profile?.company_id) loadUsers(0);
  }, [profile]);

  const loadUsers = async (start = 0) => {
    if (!profile?.company_id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error) {
      console.error('Load users error:', error);
      setHasMore(false);
    } else {
      if (start === 0) {
        setUsers(data || []);
      } else {
        setUsers(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    }

    setLoading(false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadUsers(users.length);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateUser = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          companyId: profile.company_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.error || 'Failed to create user', 'error');
        return;
      }

      showMessage(`User "${values.fullName}" created successfully!`, 'success');
      resetForm();
      loadUsers(0);

    } catch (err) {
      showMessage('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) return (
    <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Box>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <Box mb={8} textAlign="center">
        <Typography variant="h3" fontWeight="bold" className="text-gray-800">
          Welcome, Admin
        </Typography>
        <Typography variant="h6" color="text.secondary" mt={2}>
          Manage users in your company
        </Typography>
      </Box>

      {/* MESSAGE */}
      {message.text && (
        <Box
          mb={6}
          p={4}
          borderRadius={3}
          textAlign="center"
          className={`shadow-lg border-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          <Typography variant="h6" fontWeight="medium">
            {message.text}
          </Typography>
        </Box>
      )}

      <CreateUserForm
        onSubmit={handleCreateUser}
        isSubmitting={loading}
      />

      <UserList
        users={users}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        onRefresh={() => loadUsers(0)}
      />
    </div>
  );
}