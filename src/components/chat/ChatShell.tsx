'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  FiberManualRecord as StatusDot,
} from '@mui/icons-material';
import { useChatContext } from '@/contexts/ChatContext';

interface ChatShellProps {
  userId: string;
  orgId: string;
  sessionsSidebar: React.ReactNode;
  mainSidebar: React.ReactNode;
  chatArea: React.ReactNode;
  contextDrawer: React.ReactNode;
  showMainSidebar?: boolean;
  onToggleSidebar?: () => void;
}

type SystemStatus = 'live' | 'syncing' | 'offline';

const SIDEBAR_WIDTH = 280;
const CONTEXT_DRAWER_WIDTH = 320;
const HEADER_HEIGHT = 64;

export default function ChatShell({
  userId,
  orgId,
  sessionsSidebar,
  mainSidebar,
  chatArea,
  contextDrawer,
  showMainSidebar = false,
  onToggleSidebar,
}: ChatShellProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const { contextDrawer: contextDrawerState, toggleContextDrawer } = useChatContext();

  // Local state for mobile sidebar
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);

  // Which sidebar to display
  const activeSidebar = showMainSidebar ? mainSidebar : sessionsSidebar;

  // System status (could be connected to actual health check)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('live');

  useEffect(() => {
    // Check system health periodically
    const checkHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/health`);
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data.status === 'healthy' ? 'live' : 'offline');
        } else {
          setSystemStatus('offline');
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setSystemStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemStatus) => {
    switch (status) {
      case 'live':
        return 'success';
      case 'syncing':
        return 'warning';
      case 'offline':
        return 'error';
    }
  };

  const getStatusIcon = (status: SystemStatus) => {
    return <StatusDot sx={{ fontSize: 12, mr: 0.5 }} />;
  };

  const getStatusLabel = (status: SystemStatus) => {
    switch (status) {
      case 'live':
        return 'Live';
      case 'syncing':
        return 'Syncing';
      case 'offline':
        return 'Offline';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          height: HEADER_HEIGHT,
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileSessionsOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Vibodh AI
          </Typography>

          {/* Status indicator */}
          <Tooltip title={`System is ${getStatusLabel(systemStatus).toLowerCase()}`}>
            <Chip
              icon={getStatusIcon(systemStatus)}
              label={getStatusLabel(systemStatus)}
              color={getStatusColor(systemStatus)}
              size="small"
              sx={{ mr: 2 }}
            />
          </Tooltip>

          {/* Context drawer toggle */}
          <Tooltip title={contextDrawerState.isOpen ? 'Hide context' : 'Show context'}>
            <IconButton color="inherit" onClick={toggleContextDrawer}>
              {contextDrawerState.isOpen ? <CloseIcon /> : <InfoIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main content area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <Box
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {activeSidebar}
          </Box>
        )}

        {/* Sidebar - Mobile drawer */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={mobileSessionsOpen}
            onClose={() => setMobileSessionsOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: SIDEBAR_WIDTH,
                pt: `${HEADER_HEIGHT}px`,
              },
            }}
          >
            {activeSidebar}
          </Drawer>
        )}

        {/* Chat area - Center */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default',
          }}
        >
          {chatArea}
        </Box>

        {/* Context drawer - Right */}
        {contextDrawerState.isOpen && (
          <>
            {/* Desktop - permanent drawer */}
            {!isTablet && (
              <Box
                sx={{
                  width: CONTEXT_DRAWER_WIDTH,
                  flexShrink: 0,
                  borderLeft: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {contextDrawer}
              </Box>
            )}

            {/* Tablet/Mobile - temporary drawer */}
            {isTablet && (
              <Drawer
                anchor="right"
                open={contextDrawerState.isOpen}
                onClose={toggleContextDrawer}
                variant="temporary"
                sx={{
                  '& .MuiDrawer-paper': {
                    width: CONTEXT_DRAWER_WIDTH,
                    pt: `${HEADER_HEIGHT}px`,
                  },
                }}
              >
                {contextDrawer}
              </Drawer>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
