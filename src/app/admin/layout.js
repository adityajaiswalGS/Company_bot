'use client';
// src/app/admin/layout.js

import { Box } from '@mui/material';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useSelector } from 'react-redux';

const profile = useSelector((state) => state.auth.profile);

export default function AdminLayout({ children }) {
  return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />
      <Box
        component="main"
        flex={1}
        ml="280px"  // Offset for sidebar width
        bgcolor="grey.50"
      >
        {children}
      </Box>
    </Box>
  );
}