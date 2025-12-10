'use client';

import { supabase } from '@/lib/supabase';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../layout';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Refresh, PersonAdd } from '@mui/icons-material';

const UserSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be 6+ chars').required('Password is required'),
  fullName: Yup.string().min(2, 'Too short').required('Full name is required'),
});

const PAGE_SIZE = 6;

export default function AdminDashboard() {
  const { profile } = useContext(AuthContext);
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
      loadUsers(0); // Refresh from first page

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

      {/* ADD USER FORM */}
      <Box
        component="section"
        bgcolor="white"
        borderRadius={4}
        boxShadow={6}
        p={6}
        mb={10}
      >
        <Box display="flex" alignItems="center" gap={2} mb={6}>
          <PersonAdd sx={{ fontSize: 32, color: '#6366f1' }} />
          <Typography variant="h5" color='black' fontWeight="bold">
            Add New User
          </Typography>
        </Box>

        <Formik
          initialValues={{ email: '', password: '', fullName: '' }}
          validationSchema={UserSchema}
          onSubmit={handleCreateUser}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-xl border-2 text-gray-800 border-gray-300 px-6 py-4 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  />
                  <ErrorMessage name="email">
                    {(msg) => <p className="mt-2 text-sm text-red-600 font-medium">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Password (min 6 chars)"
                    className="w-full rounded-xl text-gray-800 border-2 border-gray-300 px-6 py-4 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  />
                  <ErrorMessage name="password">
                    {(msg) => <p className="mt-2 text-sm text-red-600 font-medium">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div>
                  <Field
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    className="w-full rounded-xl border-2 text-gray-800 border-gray-300 px-6 py-4 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  />
                  <ErrorMessage name="fullName">
                    {(msg) => <p className="mt-2 text-sm text-red-600 font-medium">{msg}</p>}
                  </ErrorMessage>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="contained"
                size="large"
                sx={{
                  px: 8,
                  py: 2,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  bgcolor: '#6366f1',
                  '&:hover': { bgcolor: '#4f46e5' },
                  '&:disabled': { bgcolor: '#9ca3af' },
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </Form>
          )}
        </Formik>
      </Box>

      {/* USERS LIST WITH PAGINATION */}
      <Box
        component="section"
        bgcolor="white"
        borderRadius={4}
        boxShadow={6}
        p={6}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Typography variant="h5" color='black' fontWeight="bold">
            All Users ({users.length})
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={() => loadUsers(0)} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {users.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Typography variant="h6" color="text.secondary">
              No users yet. Create the first one!
            </Typography>
          </Box>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => (
                <Box
                  key={u.id}
                  p={5}
                  bgcolor="gray.50"
                  borderRadius={3}
                  boxShadow={3}
                  className="hover:shadow-xl transition-shadow"
                >
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <Avatar sx={{ bgcolor: '#6366f1', width: 56, height: 56 }}>
                      {u.full_name?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <div>
                      <Typography variant="h6" color='black' fontWeight="bold">
                        {u.full_name || 'No Name'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {u.id}
                      </Typography>
                    </div>
                  </Box>

                  <Chip
                    label={u.role.toUpperCase()}
                    color={u.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </Typography>
                </Box>
              ))}
            </div>

            {hasMore && (
              <Box textAlign="center" mt={8}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={loadMore}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} /> : <Refresh />}
                  sx={{ px: 6, py: 2 }}
                >
                  {loading ? 'Loading...' : 'Load More Users'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </div>
  );
}