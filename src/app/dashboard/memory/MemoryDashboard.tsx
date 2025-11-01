'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Box,
  Skeleton,
  InputAdornment,
  Stack,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search,
  Memory as MemoryIcon,
  TrendingUp,
  CalendarToday,
  Clear,
  Psychology,
} from '@mui/icons-material';

interface Memory {
  id: string;
  title: string;
  content: string;
  memory_type: string;
  importance: number;
  created_at: string;
  access_count: number;
  last_accessed_at: string;
  metadata?: any;
  similarity?: number;
}

interface MemoryStats {
  total_memories: number;
  by_type: Array<{ memory_type: string; count: number }>;
  average_importance: number;
  created_this_week: number;
}

export default function MemoryDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const supabase = createClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      // Fetch stats
      const statsRes = await fetch(`${apiUrl}/api/v1/memory/stats/${profile.org_id}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent memories
      const memoriesRes = await fetch(`${apiUrl}/api/v1/memory/list/${profile.org_id}?limit=20`);
      const memoriesData = await memoriesRes.json();
      if (memoriesData.success) {
        setMemories(memoriesData.memories);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load memory data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      loadData();
      return;
    }

    setSearching(true);
    setIsSearchMode(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      const response = await fetch(`${apiUrl}/api/v1/memory/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: profile.org_id,
          query: searchQuery,
          limit: 10,
          min_importance: 0.2,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMemories(data.memories);
        setSnackbar({
          open: true,
          message: `Found ${data.count} relevant memories`,
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSnackbar({
        open: true,
        message: 'Failed to search memories',
        severity: 'error',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleConsolidate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      setSnackbar({
        open: true,
        message: 'Consolidating memories...',
        severity: 'info',
      });

      const response = await fetch(`${apiUrl}/api/v1/memory/consolidate/${profile.org_id}?lookback_days=7`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success && data.result.created > 0) {
        setSnackbar({
          open: true,
          message: `Consolidated ${data.result.consolidated} memories`,
          severity: 'success',
        });
        loadData();
      } else {
        setSnackbar({
          open: true,
          message: 'Not enough memories to consolidate',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('Error consolidating:', error);
      setSnackbar({
        open: true,
        message: 'Failed to consolidate memories',
        severity: 'error',
      });
    }
  };

  const getMemoryTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, any> = {
      conversation: 'primary',
      insight: 'secondary',
      decision: 'success',
      update: 'warning',
    };
    return colors[type] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={60} />
        <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
              <Skeleton variant="rectangular" height={120} />
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Psychology sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight="bold">
              Memory Dashboard
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            AI memory layer for long-term reasoning and context retention
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<TrendingUp />}
          onClick={handleConsolidate}
        >
          Consolidate Memories
        </Button>
      </Stack>

      {/* Stats Grid */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Memories
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total_memories}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Avg Importance
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.average_importance}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  This Week
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.created_this_week}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  By Type
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {stats.by_type.map((type: any, index: number) => (
                    <Chip
                      key={`${type.memory_type}-${index}`}
                      label={type.memory_type}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Memories
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Semantic search using embeddings - finds memories based on meaning, not just keywords
          </Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder="Search for memories by meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searching}
              sx={{ minWidth: 120 }}
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
            {isSearchMode && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchMode(false);
                  loadData();
                }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Memories List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isSearchMode ? `Search Results (${memories.length})` : 'Recent Memories'}
          </Typography>

          {memories.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MemoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                {isSearchMode ? 'No memories found matching your search' : 'No memories yet'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {memories.map((memory) => (
                <Card
                  key={memory.id}
                  variant="outlined"
                  sx={{
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.5}>
                      {/* Badges */}
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                          label={memory.memory_type}
                          color={getMemoryTypeColor(memory.memory_type)}
                          size="small"
                        />
                        <Chip
                          label={`Importance: ${(memory.importance * 100).toFixed(0)}%`}
                          variant="outlined"
                          size="small"
                        />
                        {memory.similarity !== undefined && (
                          <Chip
                            label={`Match: ${(memory.similarity * 100).toFixed(0)}%`}
                            color="secondary"
                            size="small"
                          />
                        )}
                      </Stack>

                      {/* Title */}
                      <Typography variant="h6" fontWeight="600">
                        {memory.title}
                      </Typography>

                      {/* Content */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {memory.content}
                      </Typography>

                      {/* Metadata */}
                      <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(memory.created_at)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Accessed {memory.access_count} times
                        </Typography>
                      </Stack>

                      {/* Importance Bar */}
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={memory.importance * 100}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
