'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useApp } from '@/contexts/AppContext'

interface SystemOverview {
  total_plans: number
  active_plans: number
  completed_plans: number
  failed_plans: number
  success_rate: number
  pending_approvals: number
  total_agents: number
  active_integrations: number
  health_status: string
}

interface AgentPerformance {
  agent_type: string
  total_executions: number
  successful_executions: number
  failed_executions: number
  success_rate: number
  avg_execution_time_ms: number | null
  total_actions: number
}

interface IntegrationHealth {
  integration: string
  status: string
  message: string
  response_time_ms: number | null
  checked_at: string
}

interface RecentEvent {
  event_type: string
  source_agent: string
  target_agent: string | null
  status: string
  created_at: string
}

export default function ObservabilityPage() {
  const { profile } = useApp()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth[]>([])
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Fetch overview
      const overviewRes = await fetch(`${backendUrl}/api/v1/analytics/overview?org_id=${profile.orgId}`)
      if (!overviewRes.ok) throw new Error('Failed to fetch overview')
      const overviewData = await overviewRes.json()
      setOverview(overviewData)

      // Fetch agent performance
      const performanceRes = await fetch(`${backendUrl}/api/v1/analytics/agents/performance?org_id=${profile.orgId}`)
      if (!performanceRes.ok) throw new Error('Failed to fetch agent performance')
      const performanceData = await performanceRes.json()
      setAgentPerformance(performanceData.agents || [])

      // Fetch integration health
      const healthRes = await fetch(`${backendUrl}/api/v1/analytics/integrations/health?org_id=${profile.orgId}`)
      if (!healthRes.ok) throw new Error('Failed to fetch integration health')
      const healthData = await healthRes.json()
      setIntegrationHealth(healthData.integrations || [])

      // Fetch recent events
      const eventsRes = await fetch(`${backendUrl}/api/v1/analytics/events/recent?org_id=${profile.orgId}&limit=20`)
      if (!eventsRes.ok) throw new Error('Failed to fetch events')
      const eventsData = await eventsRes.json()
      setRecentEvents(eventsData.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <HealthyIcon color="success" />
      case 'degraded':
        return <WarningIcon color="warning" />
      case 'failed':
      case 'critical':
        return <ErrorIcon color="error" />
      default:
        return <WarningIcon color="action" />
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success'
      case 'degraded':
        return 'warning'
      case 'failed':
      case 'critical':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          System Observability
        </Typography>
        <IconButton onClick={fetchData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* System Overview */}
      {overview && (
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography color="text.secondary" variant="body2">
                      Total Plans
                    </Typography>
                    <Typography variant="h4">{overview.total_plans}</Typography>
                  </div>
                  <TrendingUpIcon color="primary" fontSize="large" />
                </Box>
                <Typography variant="caption" color="success.main">
                  {overview.active_plans} active
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography color="text.secondary" variant="body2">
                      Success Rate
                    </Typography>
                    <Typography variant="h4">
                      {(overview.success_rate * 100).toFixed(0)}%
                    </Typography>
                  </div>
                  {overview.success_rate >= 0.8 ? (
                    <TrendingUpIcon color="success" fontSize="large" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="large" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {overview.completed_plans} completed, {overview.failed_plans} failed
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography color="text.secondary" variant="body2">
                      System Health
                    </Typography>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize', mt: 1 }}>
                      {overview.health_status}
                    </Typography>
                  </div>
                  {getHealthIcon(overview.health_status)}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {overview.active_integrations} integrations active
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography color="text.secondary" variant="body2">
                      Pending Approvals
                    </Typography>
                    <Typography variant="h4">{overview.pending_approvals}</Typography>
                  </div>
                  {overview.pending_approvals > 0 ? (
                    <WarningIcon color="warning" fontSize="large" />
                  ) : (
                    <HealthyIcon color="success" fontSize="large" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {overview.total_agents} agents registered
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        {/* Agent Performance */}
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 400 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Agent Performance
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : agentPerformance.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">
                  No agent performance data
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Agent</TableCell>
                        <TableCell align="right">Executions</TableCell>
                        <TableCell align="right">Success Rate</TableCell>
                        <TableCell align="right">Avg Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {agentPerformance.map((agent) => (
                        <TableRow key={agent.agent_type} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {agent.agent_type}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {agent.total_executions}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${(agent.success_rate * 100).toFixed(0)}%`}
                              size="small"
                              color={agent.success_rate >= 0.8 ? 'success' : agent.success_rate >= 0.5 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">
                              {agent.avg_execution_time_ms
                                ? `${(agent.avg_execution_time_ms / 1000).toFixed(1)}s`
                                : 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Integration Health */}
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 400 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Integration Health
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : integrationHealth.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">
                  No integration health data
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Integration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Response Time</TableCell>
                        <TableCell align="right">Last Check</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {integrationHealth.map((integration) => (
                        <TableRow key={integration.integration} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                              {integration.integration}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={integration.status}
                              size="small"
                              color={getHealthColor(integration.status) as any}
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">
                              {integration.response_time_ms ? `${integration.response_time_ms}ms` : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">
                              {formatTimeAgo(integration.checked_at)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Events */}
      <Box sx={{ width: '100%' }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Agent Events
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : recentEvents.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">
                No recent events
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event Type</TableCell>
                      <TableCell>Source Agent</TableCell>
                      <TableCell>Target Agent</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEvents.map((event, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {event.event_type.replace(/_/g, ' ')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={event.source_agent} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {event.target_agent ? (
                            <Chip label={event.target_agent} size="small" variant="outlined" />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Broadcast
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.status}
                            size="small"
                            color={event.status === 'consumed' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption">
                            {formatTimeAgo(event.created_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
