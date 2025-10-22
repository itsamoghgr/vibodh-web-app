'use client'

import { useState, useEffect } from 'react'
import { Box, Drawer, IconButton, Tooltip } from '@mui/material'
import { Info as InfoIcon, Close as CloseIcon } from '@mui/icons-material'
import { useApp } from '@/contexts/AppContext'
import { useSearchParams } from 'next/navigation'
import { ChatProvider } from '@/contexts/ChatContext'
import SessionsSidebar from '@/components/chat/SessionsSidebar'
import ChatArea from '@/components/chat/ChatArea'
import ContextDrawer from '@/components/chat/ContextDrawer'
import NotificationToast from '@/components/chat/NotificationToast'

const SESSIONS_WIDTH = 280
const CONTEXT_WIDTH = 360
const CONTEXT_DRAWER_STORAGE_KEY = 'vibodh-context-drawer-open'

export default function ChatPage() {
  const { user, profile } = useApp()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || undefined

  // Context drawer state - load from localStorage, defaults to closed
  const [contextOpen, setContextOpen] = useState(false)

  // Load drawer state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(CONTEXT_DRAWER_STORAGE_KEY)
    if (savedState !== null) {
      setContextOpen(savedState === 'true')
    }
  }, [])

  // Save drawer state to localStorage whenever it changes
  const handleContextToggle = (open: boolean) => {
    setContextOpen(open)
    localStorage.setItem(CONTEXT_DRAWER_STORAGE_KEY, String(open))
  }

  return (
    <ChatProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left: Sessions Sidebar */}
        <Box
          sx={{
            width: SESSIONS_WIDTH,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
          }}
        >
          <SessionsSidebar userId={user.id} orgId={profile.orgId} />
        </Box>

        {/* Center: Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ChatArea userId={user.id} orgId={profile.orgId} />
        </Box>

        {/* Floating Context Toggle Button */}
        {!contextOpen && (
          <Tooltip title="View Context & Sources" placement="left">
            <IconButton
              onClick={() => handleContextToggle(true)}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                zIndex: 1000,
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: 4,
                },
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Right: Collapsible Context Drawer */}
        <Drawer
          anchor="right"
          open={contextOpen}
          onClose={() => handleContextToggle(false)}
          variant="persistent"
          sx={{
            width: contextOpen ? CONTEXT_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: CONTEXT_WIDTH,
              position: 'relative',
              height: '100%',
              borderLeft: 1,
              borderColor: 'divider',
            },
          }}
        >
          {/* Close Button inside drawer */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Tooltip title="Close Context" placement="left">
              <IconButton onClick={() => handleContextToggle(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <ContextDrawer />
        </Drawer>
      </Box>

      <NotificationToast />
    </ChatProvider>
  )
}
