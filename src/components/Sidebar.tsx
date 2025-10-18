'use client'

import { useState } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard,
  Chat,
  Extension,
  Description,
  Analytics,
  Settings,
  ChevronLeft,
  ChevronRight,
  AccountTree,
  Lightbulb,
  Logout,
  AccountCircle,
} from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface SidebarProps {
  open: boolean
  onClose: () => void
  variant?: 'permanent' | 'persistent' | 'temporary'
}

const navigationItems = [
  {
    label: 'Dashboard',
    icon: Dashboard,
    href: '/dashboard',
  },
  {
    label: 'Chat',
    icon: Chat,
    href: '/dashboard/chat',
  },
  {
    label: 'Integrations',
    icon: Extension,
    href: '/dashboard/integrations',
  },
  {
    label: 'Documents',
    icon: Description,
    href: '/dashboard/documents',
  },
  {
    label: 'Knowledge Graph',
    icon: AccountTree,
    href: '/dashboard/knowledge-graph',
  },
  {
    label: 'Insights',
    icon: Lightbulb,
    href: '/dashboard/insights',
  },
  {
    label: 'Analytics',
    icon: Analytics,
    href: '/dashboard/analytics',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
]

export default function Sidebar({ open, onClose, variant = 'persistent' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const pathname = usePathname()

  const drawerWidth = collapsed ? 64 : 240
  const drawerVariant = isMobile ? 'temporary' : variant
  
  // Close sidebar on mobile when clicking outside
  const handleClose = () => {
    if (isMobile) {
      onClose()
    }
  }

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                V
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1.125rem',
              }}
            >
              Vibodh
            </Typography>
          </Box>
        )}
        
        {!isMobile && (
          <IconButton
            onClick={handleToggleCollapse}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
              },
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 'auto' : 40,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                >
                  <Icon />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'primary.main' : 'text.primary',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Footer */}
      <Divider />

      {/* User Profile & Logout */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 2,
            justifyContent: collapsed ? 'center' : 'flex-start',
            mb: collapsed ? 0 : 2,
          }}
        >
          <AccountCircle
            sx={{
              fontSize: 40,
              color: 'text.secondary',
            }}
          />
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                User Name
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                user@example.com
              </Typography>
            </Box>
          )}
        </Box>

        {!collapsed && (
          <form action="/auth/signout" method="POST">
            <IconButton
              type="submit"
              sx={{
                width: '100%',
                borderRadius: 2,
                py: 1,
                display: 'flex',
                justifyContent: 'flex-start',
                gap: 1,
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.lighter',
                },
              }}
            >
              <Logout />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Logout
              </Typography>
            </IconButton>
          </form>
        )}

        {collapsed && (
          <form action="/auth/signout" method="POST">
            <IconButton
              type="submit"
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.lighter',
                },
              }}
            >
              <Logout />
            </IconButton>
          </form>
        )}

        {!collapsed && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            Vibodh v1.0
          </Typography>
        )}
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={drawerVariant}
      open={open}
      onClose={handleClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}
