'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material'
import {
  Refresh,
  CheckCircle,
  Schedule,
  TrendingUp,
  Psychology,
  Speed,
  Storage,
  PlayArrow,
  Stop,
  CheckCircleOutline,
  CancelOutlined,
  PendingActions,
  Info,
} from '@mui/icons-material'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useApp } from '@/contexts/AppContext'

interface WorkerStatus {
  is_running: boolean
  enabled: boolean
  scheduler_running: boolean
  jobs: Array<{
    id: string
    name: string
    next_run_time: string
  }>
}

interface SystemStatus {
  success: boolean
  status: string
  statistics: {
    total_policies: number
    pending_proposals: number
    learning_cycles_completed: number
  }
  worker: WorkerStatus
  version: string
}

interface Policy {
  id: string
  org_id: string
  version: number
  is_active: boolean
  policy_config: any
  performance_metrics: any
  created_at: string
  activated_at: string | null
  created_by: string
}

interface Proposal {
  id: string
  org_id: string
  current_policy_id: string | null
  proposed_policy_config: any
  change_type: 'minor' | 'major'
  change_details: any
  status: 'pending' | 'approved' | 'rejected' | 'auto_applied' | 'expired'
  auto_apply_after: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

interface LearningCycle {
  id: string
  org_id: string
  status: 'running' | 'completed' | 'failed'
  algorithms_run: string[]
  findings: any
  performance_before: any
  performance_after: any
  proposals_created: number
  started_at: string
  completed_at: string | null
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function CILIntelligencePage() {
  const { profile } = useApp()
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [learningCycles, setLearningCycles] = useState<LearningCycle[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [triggeringLearning, setTriggeringLearning] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    if (profile?.orgId) {
      fetchAllData()
    }
  }, [profile?.orgId])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchSystemStatus(),
        fetchPolicies(),
        fetchProposals(),
        fetchLearningCycles(),
      ])
    } catch (error) {
      console.error('Error fetching CIL data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/cil/status`)
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error('Error fetching system status:', error)
    }
  }

  const fetchPolicies = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/cil/policies/${profile?.orgId}?limit=10`)
      const data = await response.json()
      if (data.success) {
        setPolicies(data.policies || [])
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
    }
  }

  const fetchProposals = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/cil/proposals/${profile?.orgId}?status=pending&limit=20`)
      const data = await response.json()
      if (data.success) {
        setProposals(data.proposals || [])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    }
  }

  const fetchLearningCycles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/cil/learning-cycles/${profile?.orgId}?limit=10`)
      const data = await response.json()
      if (data.success) {
        setLearningCycles(data.cycles || [])
      }
    } catch (error) {
      console.error('Error fetching learning cycles:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
  }

  const handleTriggerLearning = async () => {
    setTriggeringLearning(true)
    try {
      // Use the ads optimization endpoint that we tested
      const response = await fetch(`${API_BASE}/api/v1/cil/ads/trigger-optimization/${profile?.orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        alert(`Learning cycle completed successfully! ${data.proposals_created} proposals created.`)
        await fetchAllData()
      } else {
        alert(data.detail || 'Failed to trigger learning cycle')
      }
    } catch (error) {
      console.error('Error triggering learning:', error)
      alert('Failed to trigger learning cycle')
    } finally {
      setTriggeringLearning(false)
    }
  }

  const handleReviewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setReviewDialogOpen(true)
  }

  const handleSubmitReview = async (approved: boolean) => {
    if (!selectedProposal) return

    try {
      const response = await fetch(`${API_BASE}/api/v1/cil/proposals/${selectedProposal.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          reviewed_by: profile?.id,
          review_notes: reviewNotes,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert(`Proposal ${approved ? 'approved' : 'rejected'} successfully!`)
        setReviewDialogOpen(false)
        setSelectedProposal(null)
        setReviewNotes('')
        await fetchAllData()
      }
    } catch (error) {
      console.error('Error reviewing proposal:', error)
      alert('Failed to submit review')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      operational: 'success',
      running: 'info',
      completed: 'success',
      failed: 'error',
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      auto_applied: 'info',
      expired: 'default',
    }
    return colors[status] || 'default'
  }

  // Prepare chart data
  const policyPerformanceData = policies.slice(0, 5).map((policy, idx) => ({
    version: `v${policy.version}`,
    accuracy: policy.performance_metrics?.accuracy || 0,
    responseTime: policy.performance_metrics?.avg_response_time || 0,
  }))

  const proposalDistribution = [
    { name: 'Pending', value: proposals.filter(p => p.status === 'pending').length },
    { name: 'Approved', value: proposals.filter(p => p.status === 'approved').length },
    { name: 'Auto Applied', value: proposals.filter(p => p.status === 'auto_applied').length },
  ].filter(item => item.value > 0)

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading CIL Intelligence Dashboard...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            🧠 CIL Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cognitive Intelligence Layer - Self-Learning AI System
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={refreshing ? <LinearProgress sx={{ width: 20 }} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={triggeringLearning ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={handleTriggerLearning}
            disabled={triggeringLearning}
            color="primary"
          >
            {triggeringLearning ? 'Running Learning Cycle...' : 'Trigger Learning'}
          </Button>
        </Box>
      </Box>

      {/* System Status Alert */}
      {systemStatus && (
        <Alert
          severity={systemStatus.status === 'operational' ? 'success' : 'error'}
          sx={{ mb: 3 }}
          icon={systemStatus.status === 'operational' ? <CheckCircle /> : <Stop />}
        >
          <Typography variant="subtitle2">
            System Status: <strong>{systemStatus.status.toUpperCase()}</strong> | Version: {systemStatus.version}
          </Typography>
        </Alert>
      )}

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 240px', minWidth: 240 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Policies
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {systemStatus?.statistics.total_policies || 0}
                  </Typography>
                </Box>
                <Storage sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 240px', minWidth: 240 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Pending Proposals
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {systemStatus?.statistics.pending_proposals || 0}
                  </Typography>
                </Box>
                <PendingActions sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 240px', minWidth: 240 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Learning Cycles
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {systemStatus?.statistics.learning_cycles_completed || 0}
                  </Typography>
                </Box>
                <Psychology sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 240px', minWidth: 240 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Worker Status
                  </Typography>
                  <Chip
                    label={systemStatus?.worker.is_running ? 'Running' : 'Stopped'}
                    color={systemStatus?.worker.is_running ? 'success' : 'error'}
                    size="small"
                    icon={systemStatus?.worker.is_running ? <CheckCircle /> : <Stop />}
                  />
                </Box>
                <Speed sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Scheduled Jobs */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule /> Scheduled Background Jobs
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Name</TableCell>
                  <TableCell>Job ID</TableCell>
                  <TableCell>Next Run Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {systemStatus?.worker.jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                        {job.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(job.next_run_time)}</TableCell>
                    <TableCell>
                      <Chip label="Scheduled" color="info" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '2 1 500px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Policy Performance Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={policyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="version" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#4F46E5" name="Accuracy (%)" />
                  <Line type="monotone" dataKey="responseTime" stroke="#10B981" name="Response Time (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Proposal Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={proposalDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {proposalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Pending Proposals */}
      {proposals.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PendingActions /> Pending Policy Proposals
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Change Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Auto-Apply After</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {proposal.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={proposal.change_type}
                          color={proposal.change_type === 'major' ? 'error' : 'info'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={proposal.status} color={getStatusColor(proposal.status) as any} size="small" />
                      </TableCell>
                      <TableCell>
                        {proposal.auto_apply_after ? formatDate(proposal.auto_apply_after) : 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(proposal.created_at)}</TableCell>
                      <TableCell>
                        {proposal.status === 'pending' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleReviewProposal(proposal)}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Learning Cycles */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp /> Recent Learning Cycles
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Algorithms Run</TableCell>
                  <TableCell>Proposals Created</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {learningCycles.length > 0 ? (
                  learningCycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {cycle.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={cycle.status} color={getStatusColor(cycle.status) as any} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {cycle.algorithms_run.map((algo) => (
                            <Chip key={algo} label={algo} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{cycle.proposals_created}</TableCell>
                      <TableCell>{formatDate(cycle.started_at)}</TableCell>
                      <TableCell>{cycle.completed_at ? formatDate(cycle.completed_at) : 'Running...'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No learning cycles yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Review Proposal Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Policy Proposal</DialogTitle>
        <DialogContent>
          {selectedProposal && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Change Type: <Chip label={selectedProposal.change_type} size="small" color={selectedProposal.change_type === 'major' ? 'error' : 'info'} />
                </Typography>
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                Proposed Changes:
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <pre style={{ overflow: 'auto', fontSize: '0.875rem' }}>
                  {JSON.stringify(selectedProposal.change_details, null, 2)}
                </pre>
              </Paper>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review Notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add your review comments here..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleSubmitReview(false)}
            color="error"
            variant="outlined"
            startIcon={<CancelOutlined />}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleSubmitReview(true)}
            color="success"
            variant="contained"
            startIcon={<CheckCircleOutline />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
