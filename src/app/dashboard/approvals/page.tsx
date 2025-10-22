'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
} from '@mui/icons-material'
import { useApp } from '@/contexts/AppContext'

interface PendingApproval {
  id: string
  plan_id: string
  action_name: string
  description: string
  risk_level: string
  status: string
  created_at: string
  auto_approve_timeout: string
  ai_action_plans?: {
    agent_type: string
    goal: string
  }
}

interface ApprovalStats {
  pending_count: number
  approved_count: number
  rejected_count: number
  expired_count: number
  avg_approval_time_minutes: number | null
  approval_rate: number | null
}

export default function ApprovalsPage() {
  const { profile } = useApp()
  const [activeTab, setActiveTab] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [stats, setStats] = useState<ApprovalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null)
  const [decisionDialog, setDecisionDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Fetch pending approvals
      const pendingRes = await fetch(`${backendUrl}/api/v1/approvals/pending?org_id=${profile.orgId}&limit=50`)
      if (!pendingRes.ok) throw new Error('Failed to fetch pending approvals')
      const pendingData = await pendingRes.json()
      setPendingApprovals(pendingData.pending_approvals || [])

      // Fetch stats
      const statsRes = await fetch(`${backendUrl}/api/v1/approvals/stats?org_id=${profile.orgId}`)
      if (!statsRes.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approval: PendingApproval) => {
    setProcessing(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/api/v1/approvals/${approval.id}/decide?org_id=${profile.orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: true,
          execute_immediately: true,
        }),
      })

      if (!res.ok) throw new Error('Failed to approve action')

      setSuccess(`Action "${approval.action_name}" approved successfully`)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/api/v1/approvals/${selectedApproval.id}/decide?org_id=${profile.orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: false,
          reason: rejectionReason,
        }),
      })

      if (!res.ok) throw new Error('Failed to reject action')

      setSuccess(`Action "${selectedApproval.action_name}" rejected`)
      setDecisionDialog(false)
      setRejectionReason('')
      setSelectedApproval(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed')
    } finally {
      setProcessing(false)
    }
  }

  const openRejectDialog = (approval: PendingApproval) => {
    setSelectedApproval(approval)
    setDecisionDialog(true)
    setRejectionReason('')
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success'
      case 'medium':
        return 'warning'
      case 'high':
        return 'error'
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
          AI Action Approvals
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h3">{stats.pending_count}</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h3" color="success.main">
                  {stats.approved_count}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h3" color="error.main">
                  {stats.rejected_count}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 200 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Approval Rate
                </Typography>
                <Typography variant="h3">
                  {stats.approval_rate ? `${(stats.approval_rate * 100).toFixed(0)}%` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Pending Approvals Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pending Approvals
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendingApprovals.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography color="text.secondary">
                No pending approvals
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>Risk</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Timeout</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApprovals.map((approval) => (
                    <TableRow key={approval.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {approval.action_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {approval.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={approval.ai_action_plans?.agent_type || 'Unknown'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={approval.risk_level.toUpperCase()}
                          size="small"
                          color={getRiskColor(approval.risk_level) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatTimeAgo(approval.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimerIcon fontSize="small" color="action" />
                          <Typography variant="caption">
                            {formatTimeAgo(approval.auto_approve_timeout)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Approve">
                          <IconButton
                            color="success"
                            onClick={() => handleApprove(approval)}
                            disabled={processing}
                            size="small"
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            color="error"
                            onClick={() => openRejectDialog(approval)}
                            disabled={processing}
                            size="small"
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={decisionDialog} onClose={() => setDecisionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Action</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this action:
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., This action conflicts with current priorities..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={processing || !rejectionReason.trim()}
          >
            {processing ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
