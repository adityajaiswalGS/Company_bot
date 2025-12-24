'use client';

import { Box } from '@mui/material';
import AdminSidebar from '@/components/AdminSidebar';
import { useContext } from 'react';
import { AuthContext } from '@/components/AuthContextProvider';
import { redirect } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { profile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // if (!profile || profile.role !== 'admin') {
  //   redirect('/chat');  // ← Silent redirect, no "Access Denied" flash
  // }

  // Admin — show sidebar + content
  return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />

      <Box
        component="main"
        flex={1}
        sx={{
          marginLeft: { xs: 0, md: '280px' },
          bgcolor: 'grey.50',
          width: { xs: '100%', md: 'calc(100% - 280px)' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}