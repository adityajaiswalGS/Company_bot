'use client';

import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import UserCard from './UserCard';

export default function UserList({
  users,
  hasMore,
  loading,
  onLoadMore,
  onRefresh,
}) {
  return (
    <Box
      component="section"
      bgcolor="white"
      borderRadius={4}
      boxShadow={6}
      p={6}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Typography variant="h5" color="black" fontWeight="bold">
          All Users ({users.length})
        </Typography>

        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
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
              <UserCard key={u.id} user={u} />
            ))}
          </div>

          {hasMore && (
            <Box textAlign="center" mt={8}>
              <Button
                variant="outlined"
                size="large"
                onClick={onLoadMore}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={24} /> : <RefreshIcon />
                }
                sx={{ px: 6, py: 2 }}
              >
                {loading ? 'Loading...' : 'Load More Users'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
