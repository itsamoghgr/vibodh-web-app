'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Dashboard,
  Extension,
  Description,
  AccountTree,
  Lightbulb,
  Psychology,
  Analytics,
  AutoAwesome,
  Settings,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatShell from '@/components/chat/ChatShell';
import SessionsSidebar from '@/components/chat/SessionsSidebar';
import ChatArea from '@/components/chat/ChatArea';
import ContextDrawer from '@/components/chat/ContextDrawer';
import NotificationToast from '@/components/chat/NotificationToast';
import { useChat } from '@/hooks/useChat';

interface NewChatPageProps {
  userId: string;
  orgId: string;
  sessionId?: string;
}

const navigationItems = [
  { label: 'Dashboard', icon: Dashboard, href: '/dashboard' },
  { label: 'Chat', icon: ChatIcon, href: '/dashboard/chat' },
  { label: 'Integrations', icon: Extension, href: '/dashboard/integrations' },
  { label: 'Documents', icon: Description, href: '/dashboard/documents' },
  { label: 'Knowledge Graph', icon: AccountTree, href: '/dashboard/knowledge-graph' },
  { label: 'Insights', icon: Lightbulb, href: '/dashboard/insights' },
  { label: 'Memory', icon: Psychology, href: '/dashboard/memory' },
  { label: 'AI Performance', icon: Analytics, href: '/dashboard/ai-performance' },
  { label: 'Knowledge Evolution', icon: AutoAwesome, href: '/dashboard/knowledge-evolution' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

function MainSidebarContent({ onBackToChat }: { onBackToChat: () => void }) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header with Back to Chat button */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ChatIcon />}
          onClick={onBackToChat}
          sx={{ mb: 2 }}
        >
          Back to Chat
        </Button>

        {/* Vibodh Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
              V
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Vibodh
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2, overflow: 'auto' }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                  '&.Mui-selected': {
                    bgcolor: 'primary.lighter',
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          Vibodh v1.0
        </Typography>
      </Box>
    </Box>
  );
}

function ChatPageContent({ userId, orgId, sessionId }: NewChatPageProps) {
  const { loadSession } = useChat(userId, orgId);
  const [showMainMenu, setShowMainMenu] = useState(false);

  // Load session if provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  const handleToggleMenu = () => {
    setShowMainMenu(!showMainMenu);
  };

  // Single sidebar that switches content
  const sidebarContent = showMainMenu ? (
    <MainSidebarContent onBackToChat={handleToggleMenu} />
  ) : (
    <SessionsSidebar userId={userId} orgId={orgId} onToggleMainMenu={handleToggleMenu} />
  );

  return (
    <>
      <ChatShell
        userId={userId}
        orgId={orgId}
        sessionsSidebar={sidebarContent}
        mainSidebar={sidebarContent}
        chatArea={<ChatArea userId={userId} orgId={orgId} />}
        contextDrawer={<ContextDrawer />}
        showMainSidebar={false}
      />
      <NotificationToast />
    </>
  );
}

export default function NewChatPage(props: NewChatPageProps) {
  return (
    <ChatProvider>
      <ChatPageContent {...props} />
    </ChatProvider>
  );
}
