'use client'

import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material'
import { ArrowForward, MoreVert } from '@mui/icons-material'
import { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  subtitle?: string
  value?: string | number
  icon?: ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  variant?: 'default' | 'stat' | 'action'
  onClick?: () => void
  href?: string
  chip?: {
    label: string
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  }
  children?: ReactNode
}

export default function DashboardCard({
  title,
  subtitle,
  value,
  icon,
  color = 'primary',
  variant = 'default',
  onClick,
  href,
  chip,
  children,
}: DashboardCardProps) {
  const theme = useTheme()

  const getColorValue = (color: string) => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main
      case 'secondary':
        return theme.palette.secondary.main
      case 'success':
        return theme.palette.success.main
      case 'warning':
        return theme.palette.warning.main
      case 'error':
        return theme.palette.error.main
      default:
        return theme.palette.primary.main
    }
  }

  const cardContent = (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick || href ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          '& .card-icon': {
            transform: 'scale(1.1)',
          },
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {icon && (
              <Box
                className="card-icon"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  backgroundColor: `${getColorValue(color)}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getColorValue(color),
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 2px 8px ${getColorValue(color)}20`,
                }}
              >
                {icon}
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 0.5,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.4 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          {chip && (
            <Chip
              label={chip.label}
              size="small"
              color={chip.color || 'default'}
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {/* Value (for stat cards) */}
        {variant === 'stat' && value && (
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: getColorValue(color),
              mb: 1,
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        )}

        {/* Custom content */}
        {children}

        {/* Action indicator */}
        {(onClick || href) && variant === 'action' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mt: 2,
            }}
          >
            <ArrowForward
              sx={{
                fontSize: 20,
                color: 'text.secondary',
                transition: 'transform 0.2s ease-in-out',
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )

  if (onClick || href) {
    return (
      <CardActionArea
        component={href ? 'a' : 'button'}
        href={href}
        onClick={onClick}
        sx={{ height: '100%', display: 'flex' }}
      >
        {cardContent}
      </CardActionArea>
    )
  }

  return cardContent
}
