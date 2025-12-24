'use client';
// src/components/layout/AdminSidebar.js

import { useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Box, Typography, Button } from '@mui/material';
import { Dashboard, UploadFile, Chat, Logout } from '@mui/icons-material';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <Dashboard /> },
  { label: 'Documents', href: '/admin/documents', icon: <UploadFile /> },
  { label: 'Chat', href: '/chat', icon: <Chat /> },
];

export default function AdminSidebar() {
const profile = useSelector((state) => state.auth.profile);
const role = profile?.role;
const companyId = profile?.company_id;
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
      }}
    >
      {/* Header with Name */}
      <Box p={4} borderBottom={1} borderColor="divider">
        <Typography variant="h6" fontWeight="bold" color="primary">
          Admin Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Hello, {profile?.full_name || 'Admin'}
        </Typography>
      </Box>

      {/* Navigation */}
      <Box flex={1} p={2}>
        {navItems.map((item) => (
          <Button
            key={item.href}
            href={item.href}
            fullWidth
            variant={pathname.startsWith(item.href) ? 'contained' : 'text'}
            color="primary"
            startIcon={item.icon}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              mb: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: pathname.startsWith(item.href) ? 'bold' : 'medium',
              bgcolor: pathname.startsWith(item.href) ? 'primary.main' : 'transparent',
              color: pathname.startsWith(item.href) ? 'white' : 'text.primary',
              '&:hover': {
                bgcolor: pathname.startsWith(item.href) ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Logout */}
      <Box p={3} borderTop={1} borderColor="divider">
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}