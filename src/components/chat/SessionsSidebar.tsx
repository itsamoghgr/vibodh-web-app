'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useChatContext } from '@/contexts/ChatContext';
import { useSessions } from '@/hooks/useSessions';
import { ChatSession, SessionCategory } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface SessionsSidebarProps {
  userId: string;
  orgId: string;
  onToggleMainMenu?: () => void;
}

export default function SessionsSidebar({ userId, orgId, onToggleMainMenu }: SessionsSidebarProps) {
  const router = useRouter();
  const { currentSession } = useChatContext();
  const {
    sessions,
    isLoading,
    loadSessions,
    selectSession,
    createSession,
    deleteSession,
    archiveSession,
  } = useSessions(userId, orgId);

  const [selectedFilter, setSelectedFilter] = useState<SessionCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionMenuAnchor, setSessionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions(selectedFilter);
  }, [selectedFilter, loadSessions]);

  const handleFilterChange = (event: React.SyntheticEvent, newValue: SessionCategory) => {
    setSelectedFilter(newValue);
  };

  const handleNewChat = async () => {
    try {
      await createSession(undefined, selectedFilter === 'all' ? 'general' : selectedFilter);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    selectSession(sessionId);
  };

  const handleSessionMenuOpen = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
    event.stopPropagation();
    setSessionMenuAnchor(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  const handleSessionMenuClose = () => {
    setSessionMenuAnchor(null);
    setSelectedSessionId(null);
  };

  const handleArchiveSession = async () => {
    if (selectedSessionId) {
      await archiveSession(selectedSessionId);
      handleSessionMenuClose();
    }
  };

  const handleDeleteSession = async () => {
    if (selectedSessionId) {
      await deleteSession(selectedSessionId);
      handleSessionMenuClose();
    }
  };

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryLabel = (category: SessionCategory) => {
    switch (category) {
      case 'all':
        return 'All';
      case 'marketing':
        return 'Marketing';
      case 'ops':
        return 'Operations';
      case 'insights':
        return 'Insights';
      case 'general':
        return 'General';
      default:
        return category;
    }
  };

  const getSessionCategoryColor = (session: ChatSession) => {
    const category = session.category || 'general';
    switch (category) {
      case 'marketing':
        return 'primary';
      case 'ops':
        return 'secondary';
      case 'insights':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        {/* Toggle to Main Menu Button */}
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ArrowBackIcon />}
          onClick={onToggleMainMenu}
          sx={{ mb: 2 }}
        >
          Main Menu
        </Button>

        {/* New Chat Button */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{ mb: 2 }}
        >
          New Chat
        </Button>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedFilter}
          onChange={handleFilterChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
        >
          <Tab label="All" value="all" sx={{ minHeight: 48 }} />
          <Tab label="Marketing" value="marketing" sx={{ minHeight: 48 }} />
          <Tab label="Ops" value="ops" sx={{ minHeight: 48 }} />
          <Tab label="Insights" value="insights" sx={{ minHeight: 48 }} />
        </Tabs>
      </Box>

      {/* Sessions list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredSessions.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <ChatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No sessions found' : 'No sessions yet'}
            </Typography>
            {!searchQuery && (
              <Typography variant="caption" color="text.secondary">
                Click "New Chat" to start
              </Typography>
            )}
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            {filteredSessions.map((session) => (
              <ListItemButton
                key={session.id}
                selected={currentSession?.id === session.id}
                onClick={() => handleSessionClick(session.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {session.title}
                    </Typography>
                    {session.category && session.category !== 'general' && (
                      <Chip
                        label={getCategoryLabel(session.category)}
                        size="small"
                        color={getSessionCategoryColor(session)}
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {session.messageCount} messages
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => handleSessionMenuOpen(e, session.id)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      {/* Session context menu */}
      <Menu
        anchorEl={sessionMenuAnchor}
        open={Boolean(sessionMenuAnchor)}
        onClose={handleSessionMenuClose}
      >
        <MenuItem onClick={handleArchiveSession}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleDeleteSession} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
