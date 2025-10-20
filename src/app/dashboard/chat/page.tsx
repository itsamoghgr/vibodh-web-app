'use client'

import { Box } from '@mui/material'
import { useApp } from '@/contexts/AppContext'
import { useSearchParams } from 'next/navigation'
import { ChatProvider } from '@/contexts/ChatContext'
import SessionsSidebar from '@/components/chat/SessionsSidebar'
import ChatArea from '@/components/chat/ChatArea'
import ContextDrawer from '@/components/chat/ContextDrawer'
import NotificationToast from '@/components/chat/NotificationToast'

const SESSIONS_WIDTH = 280
const CONTEXT_WIDTH = 320

export default function ChatPage() {
  const { user, profile } = useApp()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || undefined

  return (
    <ChatProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
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

        {/* Right: Context Drawer */}
        <Box
          sx={{
            width: CONTEXT_WIDTH,
            flexShrink: 0,
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
          }}
        >
          <ContextDrawer />
        </Box>
      </Box>

      <NotificationToast />
    </ChatProvider>
  )
}
