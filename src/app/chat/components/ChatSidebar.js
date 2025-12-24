'use client';
// src/app/chat/components/ChatSidebar.js

import { Box, Drawer, Typography, List, ListItem, ListItemText, ListItemIcon, Checkbox, IconButton, Tooltip } from '@mui/material';
import { Refresh, Logout, FolderOpen, Menu } from '@mui/icons-material';

export default function ChatSidebar({
  open,
  onToggle,
  documents,
  selectedDocs,
  onToggleDoc,
  refreshLoading,
  onRefresh,
  onLogout,
}) {
  return (
    <>
      <IconButton
        onClick={onToggle}
        sx={{
          position: 'absolute',
          left: open ? 420 : 16,
          top: 100,
          zIndex: 1400,
          bgcolor: 'white',
          boxShadow: 6,
          width: 56,
          height: 56,
          border: '2px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': { bgcolor: '#f8f9fa', transform: 'scale(1.08)' },
        }}
      >
        {open ? <FolderOpen /> : <Menu />}
      </IconButton>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: open ? 420 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 420,
            bgcolor: '#1e293b',
            color: 'white',
            borderRight: 'none',
            transition: 'width 0.3s ease',
          },
        }}
      >
        <Box p={4} height="100%" display="flex" flexDirection="column">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h5" fontWeight="bold">
              Your Documents
            </Typography>
            <Box>
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} disabled={refreshLoading} color="inherit">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton onClick={onLogout} color="inherit">
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="body2" color="gray.400" mb={3}>
            {selectedDocs.length} of {documents.length} selected
          </Typography>

          <Box flex={1} overflow="auto" pr={1}>
            {documents.length === 0 ? (
              <Typography textAlign="center" color="gray.500" mt={8}>
                No documents ready
              </Typography>
            ) : (
              <List>
                {documents.map((doc) => (
                  <ListItem
                    key={doc.id}
                    onClick={() => onToggleDoc(doc.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      bgcolor: selectedDocs.includes(doc.id) ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                      '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedDocs.includes(doc.id)}
                        tabIndex={-1}
                        disableRipple
                        sx={{ color: 'white' }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.file_name}
                      secondary={doc.auto_summary?.substring(0, 60) + '...' || 'No summary'}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondaryTypographyProps={{ color: 'gray.400' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}