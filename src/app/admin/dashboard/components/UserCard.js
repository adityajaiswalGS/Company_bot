'use client';
// src/app/admin/dashboard/components/UserCard.js

import { Box, Typography, Avatar, Chip, Tooltip } from '@mui/material';

export default function UserCard({ user }) {
  const initials = user.full_name?.[0]?.toUpperCase() || 'U';
  const displayName = user.full_name || 'No Name';
  const truncatedName = displayName.length > 20 ? displayName.slice(0, 20) + '...' : displayName;

  return (
    <Box
      p={5}
      bgcolor="gray.50"
      borderRadius={3}
      boxShadow={3}
      className="hover:shadow-xl transition-shadow"
    >
      <Box display="flex" alignItems="center" gap={3} mb={3}>
        <Avatar sx={{ bgcolor: '#6366f1', width: 56, height: 56 }}>
          {initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <Tooltip title={displayName}>
            <Typography
              variant="h6"
              color="black"
              fontWeight="bold"
              className="truncate"
            >
              {truncatedName}
            </Typography>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" className="truncate">
            {user.id}
          </Typography>
        </div>
      </Box>

      <Chip
        label={user.role.toUpperCase()}
        color={user.role === 'admin' ? 'primary' : 'default'}
        size="small"
        sx={{ mb: 2 }}
      />

      <Typography variant="caption" color="text.secondary">
        Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
      </Typography>
    </Box>
  );
}