'use client'

import { useState } from 'react'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import { AppProvider, User, Profile, Organization } from '@/contexts/AppContext'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

interface AppShellProps {
  children: React.ReactNode
  user: User
  profile: Profile
  organization: Organization
}

export default function AppShell({ children, user, profile, organization }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true })

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <AppProvider user={user} profile={profile} organization={organization}>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Sidebar - Persistent across all routes */}
        <Sidebar
          open={isMobile ? sidebarOpen : true}
          onClose={handleSidebarClose}
          variant={isMobile ? 'temporary' : 'permanent'}
        />

        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Navbar - only show on mobile */}
          {isMobile && (
            <Navbar
              onMenuClick={handleSidebarToggle}
              showMenuButton={true}
            />
          )}

          {/* Dynamic Page Content - This is where routes swap */}
          <Box
            component="main"
            sx={{
              flex: 1,
              bgcolor: 'background.default',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AppProvider>
  )
}
