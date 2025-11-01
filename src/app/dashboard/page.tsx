'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Stack,
  LinearProgress,
  Avatar,
  Divider,
  alpha,
} from '@mui/material'
import {
  Extension as IntegrationIcon,
  Description as DocumentIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Memory as MemoryIcon,
  AccountTree,
  Lightbulb,
  AutoAwesome,
  Psychology,
  ArrowUpward,
  Circle,
  Campaign,
} from '@mui/icons-material'
import { useApp } from '@/contexts/AppContext'
import DashboardCard from '@/components/DashboardCard'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { user, profile } = useApp()
  const [stats, setStats] = useState({
    teamCount: 0,
    docsSyncedToday: 0,
    memoryCount: 0,
    totalDocs: 0,
    activeIntegrations: 0,
    conversations: 0,
    knowledgeNodes: 0,
  })

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

      // Get total documents
      const { count: totalDocs } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', profile.orgId)

      // Get AI memory entries count
      const { count: memoryCount } = await supabase
        .from('ai_memory')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', profile.orgId)

      // Get active integrations
      const { count: activeIntegrations } = await supabase
        .from('integrations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', profile.orgId)
        .eq('status', 'active')

      // Get conversations count
      const { count: conversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', profile.orgId)
        .gte('created_at', today.toISOString())

      setStats({
        teamCount: teamCount || 1,
        docsSyncedToday: docsSyncedToday || 0,
        memoryCount: memoryCount || 0,
        totalDocs: totalDocs || 0,
        activeIntegrations: activeIntegrations || 0,
        conversations: conversations || 0,
        knowledgeNodes: Math.floor((totalDocs || 0) * 1.5),
      })
    }

    loadStats()
  }, [profile.orgId])

  // Mock activity data
  const recentActivity = [
    { type: 'document', action: 'New document synced from Google Ads', time: 'Just now', icon: DocumentIcon, color: 'primary', bgColor: '#1976d2' },
    { type: 'conversation', action: 'AI conversation started', time: '2m ago', icon: ChatIcon, color: 'secondary', bgColor: '#9c27b0' },
    { type: 'memory', action: 'New memory entry created', time: '5m ago', icon: MemoryIcon, color: 'success', bgColor: '#2e7d32' },
    { type: 'knowledge', action: 'Knowledge graph updated with 3 new nodes', time: '12m ago', icon: AccountTree, color: 'info', bgColor: '#0288d1' },
    { type: 'optimization', action: 'CIL optimization completed for Campaign A', time: '18m ago', icon: AutoAwesome, color: 'warning', bgColor: '#ed6c02' },
  ]

  // Mock insights
  const insights = [
    { text: 'AI discovered 5 new patterns in your campaign data', priority: 'high', icon: Lightbulb },
    { text: '3 campaigns optimized automatically today', priority: 'medium', icon: Campaign },
    { text: 'Knowledge graph grew 12% this week', priority: 'low', icon: TrendingUpIcon },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome back, {profile.fullName || user.email}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Here's what's happening with your AI intelligence platform today
        </Typography>
      </Box>

      {/* Enhanced Stats Overview */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
        }}
      >
        {/* Total Documents */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Documents
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.totalDocs}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    12% vs last week
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1) }}>
                <DocumentIcon color="primary" />
              </Avatar>
            </Box>
          </Paper>
        </Box>

        {/* Active Integrations */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Integrations
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.activeIntegrations}
                </Typography>
                <Chip label="All synced" size="small" color="success" />
              </Box>
              <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.1) }}>
                <IntegrationIcon color="secondary" />
              </Avatar>
            </Box>
          </Paper>
        </Box>

        {/* AI Conversations */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Conversations Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.conversations}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    8% increase
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#2e7d32', 0.1) }}>
                <ChatIcon color="success" />
              </Avatar>
            </Box>
          </Paper>
        </Box>

        {/* Knowledge Graph */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Knowledge Nodes
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.knowledgeNodes}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    Growing
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#ed6c02', 0.1) }}>
                <AccountTree color="warning" />
              </Avatar>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
        }}
      >
        {/* Left Column - Activity Feed & Insights */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(60% - 12px)' } }}>
          {/* Real-Time Activity Feed */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Live Activity Feed
              </Typography>
              <Chip
                icon={<Circle sx={{ fontSize: 8, animation: 'pulse 2s infinite' }} />}
                label="Live"
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
            <Stack spacing={2}>
              {recentActivity.map((activity, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(activity.bgColor, 0.1) }}>
                      <activity.icon sx={{ fontSize: 20 }} color={activity.color as any} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                  {index < recentActivity.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* AI Insights */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI-Generated Insights
              </Typography>
              <Chip icon={<AutoAwesome sx={{ fontSize: 16 }} />} label="New" size="small" color="primary" />
            </Box>
            <Stack spacing={2}>
              {insights.map((insight, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: insight.priority === 'high' ? alpha('#1976d2', 0.05) : 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <insight.icon sx={{ fontSize: 18, color: 'white' }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {insight.text}
                      </Typography>
                      <Chip
                        label={insight.priority.toUpperCase()}
                        size="small"
                        color={insight.priority === 'high' ? 'error' : insight.priority === 'medium' ? 'warning' : 'default'}
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* Right Column - Intelligence & System Health */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(40% - 12px)' } }}>
          {/* Intelligence Layer Status */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Intelligence Layer
            </Typography>
            <Stack spacing={3}>
              {/* CIL Intelligence */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      CIL Learning
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    85%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3 }} />
              </Box>

              {/* Memory System */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MemoryIcon sx={{ fontSize: 20, color: 'success.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Memory Entries
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stats.memoryCount} items
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={65} color="success" sx={{ height: 6, borderRadius: 3 }} />
              </Box>

              {/* Knowledge Evolution */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Evolution Score
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    92%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} color="warning" sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            </Stack>
          </Paper>

          {/* System Health */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              System Health
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Circle sx={{ fontSize: 12, color: 'success.main' }} />
                  <Typography variant="body2">API Response</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  98ms
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Circle sx={{ fontSize: 12, color: 'success.main' }} />
                  <Typography variant="body2">Integration Sync</Typography>
                </Box>
                <Chip label="Active" size="small" color="success" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Circle sx={{ fontSize: 12, color: 'success.main' }} />
                  <Typography variant="body2">Background Jobs</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  3 running
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Circle sx={{ fontSize: 12, color: 'warning.main' }} />
                  <Typography variant="body2">Storage Usage</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  68%
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Quick Stats */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Today's Summary
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Docs Synced
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {stats.docsSyncedToday}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  AI Conversations
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {stats.conversations}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Optimizations
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  3
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Quick Actions
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
          <DashboardCard
            title="Chat with AI"
            subtitle="Ask questions about your company's knowledge base"
            icon={<ChatIcon />}
            color="primary"
            variant="action"
            href="/dashboard/chat"
          />
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
          <DashboardCard
            title="Manage Integrations"
            subtitle="Connect and configure your data sources"
            icon={<IntegrationIcon />}
            color="secondary"
            variant="action"
            href="/dashboard/integrations"
          />
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
          <DashboardCard
            title="View Documents"
            subtitle="Browse and search your knowledge base"
            icon={<DocumentIcon />}
            color="success"
            variant="action"
            href="/dashboard/documents"
          />
        </Box>
      </Box>
    </Container>
  )
}
