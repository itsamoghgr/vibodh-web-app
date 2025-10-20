'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Stack,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Extension as IntegrationIcon,
  Description as DocumentIcon,
  Chat as ChatIcon,
  TrendingUp as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Memory as MemoryIcon,
  Today as TodayIcon,
} from '@mui/icons-material'
import { useApp } from '@/contexts/AppContext'
import DashboardCard from '@/components/DashboardCard'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { user, profile, organization } = useApp()
  const [stats, setStats] = useState({
    teamCount: 0,
    docsSyncedToday: 0,
    memoryCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()

      // Get team members count
      const { count: teamCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', profile.orgId)

      // Get documents synced today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: docsSyncedToday } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', profile.orgId)
        .gte('created_at', today.toISOString())

      // Get AI memory entries count
      const { count: memoryCount } = await supabase
        .from('ai_memory')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', profile.orgId)

      setStats({
        teamCount: teamCount || 1,
        docsSyncedToday: docsSyncedToday || 0,
        memoryCount: memoryCount || 0,
      })
      setLoading(false)
    }

    loadStats()
  }, [profile.orgId])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome back, {profile.fullName || user.email}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Your organization is ready to start ingesting data and gaining AI-powered insights.
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <DashboardCard
          title="Organization"
          subtitle={organization.name}
          value={stats.teamCount}
          icon={<BusinessIcon />}
          color="primary"
          variant="stat"
          chip={{
            label: 'Active',
            color: 'success',
          }}
        />
        <DashboardCard
          title="Docs Synced Today"
          subtitle="New documents added"
          value={stats.docsSyncedToday}
          icon={<TodayIcon />}
          color="secondary"
          variant="stat"
        />
        <DashboardCard
          title="AI Memory Entries"
          subtitle="Total memories stored"
          value={stats.memoryCount}
          icon={<MemoryIcon />}
          color="success"
          variant="stat"
        />
      </Box>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Quick Actions
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        <DashboardCard
          title="Chat with AI"
          subtitle="Ask questions about your company's knowledge base"
          icon={<ChatIcon />}
          color="primary"
          variant="action"
          href="/dashboard/chat"
        />

        <DashboardCard
          title="Integrations"
          subtitle="Connect your tools (Slack, Notion, Drive) to enable AI-powered insights"
          icon={<IntegrationIcon />}
          color="secondary"
          variant="action"
          href="/dashboard/integrations"
        />

        <DashboardCard
          title="Documents"
          subtitle="View and manage ingested data from your connected integrations"
          icon={<DocumentIcon />}
          color="success"
          variant="action"
          href="/dashboard/documents"
        />
      </Box>

      {/* Recent Activity */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Recent Activity
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                Organization created successfully
              </Typography>
              <Chip label="Today" size="small" color="primary" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IntegrationIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Ready to connect your first integration
              </Typography>
              <Chip label="Next step" size="small" color="secondary" />
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  )
}
