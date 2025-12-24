'use client';
// src/app/chat/components/ChatHeader.js

import { Box, Typography, Chip } from '@mui/material';
import { SmartToy } from '@mui/icons-material';

export default function ChatHeader({ user, companyId }) {
  return (
    <Box
      p={4}
      bgcolor="white"
      borderBottom={1}
      borderColor="gray.200"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center" gap={3}>
        <SmartToy sx={{ fontSize: 40, color: '#6366f1' }} />
        <div>
          <Typography variant="h5" fontWeight="bold" color="black">
            Company AI Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.user_metadata?.full_name || user?.email}
          </Typography>
        </div>
      </Box>

      <Chip
        label={`Company: ${companyId.substring(0, 8)}...`}
        color="primary"
        variant="outlined"
      />
    </Box>
  );
}