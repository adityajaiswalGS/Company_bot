'use client';

// src/app/admin/layout.js
import { Box } from '@mui/material';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useContext } from 'react';
import { AuthContext } from '@/components/AuthContextProvider';

export default function AdminLayout({ children }) {
  const { profile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center text-xl text-red-600">
        Access Denied
      </div>
    );
  }

  return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />

      {/* MAIN CONTENT — FIXED OFFSET */}
      <Box
        component="main"
        flex={1}
        sx={{
          marginLeft: { xs: 0, md: '280px' },  // ← Correct MUI syntax
          bgcolor: 'grey.50',
          width: { xs: '100%', md: 'calc(100% - 280px)' },  // Ensures full width
        }}
      >
        {children}
      </Box>
    </Box>
  );
}