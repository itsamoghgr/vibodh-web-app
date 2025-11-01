'use client'

import { useState, useEffect } from 'react'
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
  Collapse,
} from '@mui/material'
import {
  Dashboard,
  Chat,
  Extension,
  Description,
  Analytics,
  ChevronLeft,
  ChevronRight,
  AccountTree,
  Lightbulb,
  Logout,
  AccountCircle,
  Psychology,
  AutoAwesome,
  CheckCircle,
  Visibility,
  TrendingUp,
  ExpandLess,
  ExpandMore,
  Layers,
} from '@mui/icons-material'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
    label: 'Intelligence Layer',
    icon: Layers,
    children: [
      {
        label: 'Insights',
        icon: Lightbulb,
        href: '/dashboard/insights',
      },
      {
        label: 'Memory',
        icon: Psychology,
        href: '/dashboard/memory',
      },
      {
        label: 'AI Performance',
        icon: Analytics,
        href: '/dashboard/ai-performance',
      },
      {
        label: 'Knowledge Evolution',
        icon: AutoAwesome,
        href: '/dashboard/knowledge-evolution',
      },
      {
        label: 'CIL Intelligence',
        icon: Psychology,
        href: '/dashboard/cil-intelligence',
      },
    ],
  },
  {
    label: 'Approvals',
    icon: CheckCircle,
    href: '/dashboard/approvals',
  },
  {
    label: 'Observability',
    icon: Visibility,
    href: '/dashboard/observability',
  },
  {
    label: 'Ads Analytics',
    icon: TrendingUp,
    href: '/dashboard/ads-analytics',
  },
]

export default function Sidebar({ open, onClose, variant = 'persistent' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const drawerWidth = collapsed ? 64 : 240
  const drawerVariant = isMobile ? 'temporary' : variant

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-expanded-sections')
    if (savedState) {
      try {
        setExpandedSections(JSON.parse(savedState))
      } catch (e) {
        // If parsing fails, default to Intelligence Layer expanded
        setExpandedSections({ 'Intelligence Layer': true })
      }
    } else {
      // Default: expand Intelligence Layer
      setExpandedSections({ 'Intelligence Layer': true })
    }
  }, [])

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-expanded-sections', JSON.stringify(expandedSections))
  }, [expandedSections])

  // Toggle section expansion
  const handleToggleSection = (label: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  // Check if any child of a parent section is active
  const isParentActive = (children: any[]) => {
    return children.some((child) => child.href === pathname)
  }
  
  // Close sidebar on mobile when clicking outside
  const handleClose = () => {
    if (isMobile) {
      onClose()
    }
  }

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
      }

      // Redirect to login page
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Redirect anyway even if there's an error
      router.push('/login')
    }
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
          const hasChildren = 'children' in item && item.children
          const isActive = !hasChildren && pathname === item.href
          const isExpanded = expandedSections[item.label] || false
          const childActive = hasChildren && isParentActive(item.children)

          return (
            <Box key={item.label}>
              {/* Parent Item (or Regular Item) */}
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={hasChildren ? 'div' : Link}
                  href={hasChildren ? undefined : item.href}
                  selected={isActive || childActive}
                  onClick={hasChildren ? () => handleToggleSection(item.label) : undefined}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 'auto' : 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: (isActive || childActive) ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  {!collapsed && (
                    <>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: (isActive || childActive) ? 600 : 500,
                          color: (isActive || childActive) ? 'primary.main' : 'text.primary',
                        }}
                      />
                      {hasChildren && (
                        isExpanded ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Nested Children */}
              {hasChildren && !collapsed && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      const isChildActive = pathname === child.href

                      return (
                        <ListItem key={child.label} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            component={Link}
                            href={child.href}
                            selected={isChildActive}
                            sx={{
                              borderRadius: 2,
                              minHeight: 40,
                              pl: 4,
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 36,
                                color: isChildActive ? 'primary.main' : 'text.secondary',
                              }}
                            >
                              <ChildIcon sx={{ fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: '0.8125rem',
                                fontWeight: isChildActive ? 600 : 400,
                                color: isChildActive ? 'primary.main' : 'text.secondary',
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
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
          <IconButton
            onClick={handleLogout}
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
        )}

        {collapsed && (
          <IconButton
            onClick={handleLogout}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.lighter',
              },
            }}
          >
            <Logout />
          </IconButton>
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
