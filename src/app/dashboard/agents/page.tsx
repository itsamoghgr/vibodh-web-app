'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  AutoAwesome as AutoAwesomeIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import DashboardCard from '@/components/DashboardCard';

// Type definitions for agent data
interface Agent {
  id: string;
  agent_type: string;
  agent_name: string;
  status: 'active' | 'inactive' | 'testing';
  capabilities: string[];
  supported_integrations: string[];
}

interface ActionPlan {
  id: string;
  agent_type: string;
  goal: string;
  status: 'draft' | 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  total_steps: number;
  completed_steps: number;
  requires_approval: boolean;
  created_at: string;
}

interface PendingAction {
  id: string;
  plan_id: string;
  action_name: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_approval: boolean;
  target_integration?: string;
  created_at: string;
  expires_at: string;
}

interface AgentStatistics {
  total_plans: number;
  completed_plans: number;
  success_rate: number;
  average_execution_time_ms: number;
  high_risk_actions: number;
}

export default function AgentsPage() {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [statistics, setStatistics] = useState<AgentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [executionGoal, setExecutionGoal] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);

  // Mock data loading (replace with actual API calls)
  useEffect(() => {
    loadAgentsData();
  }, []);

  const loadAgentsData = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      const mockAgents: Agent[] = [
        {
          id: '1',
          agent_type: 'marketing_agent',
          agent_name: 'Marketing Agent',
          status: 'active',
          capabilities: ['campaign_planning', 'content_generation', 'analytics_tracking'],
          supported_integrations: ['slack', 'hubspot']
        },
        {
          id: '2',
          agent_type: 'ops_agent',
          agent_name: 'Operations Agent',
          status: 'active',
          capabilities: ['task_automation', 'process_optimization', 'monitoring'],
          supported_integrations: ['slack', 'clickup', 'jira']
        }
      ];

      const mockPlans: ActionPlan[] = [
        {
          id: '1',
          agent_type: 'marketing_agent',
          goal: 'Launch Q1 marketing campaign',
          status: 'pending',
          risk_level: 'medium',
          total_steps: 5,
          completed_steps: 0,
          requires_approval: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          agent_type: 'ops_agent',
          goal: 'Automate daily standup reminders',
          status: 'executing',
          risk_level: 'low',
          total_steps: 3,
          completed_steps: 1,
          requires_approval: false,
          created_at: new Date().toISOString()
        }
      ];

      const mockPendingActions: PendingAction[] = [
        {
          id: '1',
          plan_id: '1',
          action_name: 'Create campaign content',
          description: 'Generate marketing copy for Q1 campaign',
          risk_level: 'medium',
          requires_approval: true,
          target_integration: 'hubspot',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString()
        }
      ];

      const mockStats: AgentStatistics = {
        total_plans: 25,
        completed_plans: 18,
        success_rate: 0.85,
        average_execution_time_ms: 45000,
        high_risk_actions: 3
      };

      setAgents(mockAgents);
      setPlans(mockPlans);
      setPendingActions(mockPendingActions);
      setStatistics(mockStats);
      setLoading(false);

    } catch (err) {
      setError('Failed to load agent data');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleExecuteAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setExecuteDialogOpen(true);
  };

  const handleExecuteSubmit = async () => {
    if (!selectedAgent || !executionGoal) return;

    try {
      // TODO: Call API to execute agent
      console.log('Executing agent:', selectedAgent.agent_type, 'with goal:', executionGoal);

      // Close dialog and refresh
      setExecuteDialogOpen(false);
      setExecutionGoal('');
      setSelectedAgent(null);
      loadAgentsData();
    } catch (err) {
      setError('Failed to execute agent');
    }
  };

  const handleApproveAction = async (actionId: string) => {
    try {
      // TODO: Call API to approve action
      console.log('Approving action:', actionId);
      loadAgentsData();
    } catch (err) {
      setError('Failed to approve action');
    }
  };

  const handleRejectAction = async (actionId: string) => {
    try {
      // TODO: Call API to reject action
      console.log('Rejecting action:', actionId);
      loadAgentsData();
    } catch (err) {
      setError('Failed to reject action');
    }
  };

  const handleViewPlan = (plan: ActionPlan) => {
    setSelectedPlan(plan);
    setViewDialogOpen(true);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'executing': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Decision Agents
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage autonomous agents that can execute actions in your business environment
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Total Plans"
              value={statistics.total_plans}
              icon={<AutoAwesomeIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Success Rate"
              value={`${(statistics.success_rate * 100).toFixed(0)}%`}
              icon={<CheckCircleIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Avg Execution Time"
              value={`${(statistics.average_execution_time_ms / 1000).toFixed(1)}s`}
              icon={<TimelineIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="High Risk Actions"
              value={statistics.high_risk_actions}
              icon={<SecurityIcon />}
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs for different views */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Registered Agents" />
          <Tab label="Action Plans" />
          <Tab label="Pending Approvals" />
        </Tabs>
      </Paper>

      {/* Registered Agents Tab */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Capabilities</TableCell>
                <TableCell>Integrations</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <SmartToyIcon sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">{agent.agent_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agent.agent_type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={agent.status}
                      color={getStatusColor(agent.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {agent.capabilities.slice(0, 2).map((cap) => (
                      <Chip key={cap} label={cap} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                    {agent.capabilities.length > 2 && (
                      <Chip label={`+${agent.capabilities.length - 2} more`} size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {agent.supported_integrations.map((int) => (
                      <Chip key={int} label={int} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Execute Agent">
                      <IconButton
                        color="primary"
                        onClick={() => handleExecuteAgent(agent)}
                        disabled={agent.status !== 'active'}
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Plans Tab */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Goal</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.goal}</TableCell>
                  <TableCell>{plan.agent_type}</TableCell>
                  <TableCell>
                    <Chip
                      label={plan.status}
                      color={getStatusColor(plan.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.risk_level}
                      color={getRiskLevelColor(plan.risk_level) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {plan.completed_steps}/{plan.total_steps} steps
                  </TableCell>
                  <TableCell>
                    {new Date(plan.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewPlan(plan)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {plan.status === 'executing' && (
                      <Tooltip title="Pause">
                        <IconButton size="small" color="warning">
                          <PauseIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {plan.status !== 'completed' && plan.status !== 'cancelled' && (
                      <Tooltip title="Cancel">
                        <IconButton size="small" color="error">
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Integration</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>{action.action_name}</TableCell>
                  <TableCell>{action.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={action.risk_level}
                      color={getRiskLevelColor(action.risk_level) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{action.target_integration || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(action.expires_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Approve">
                      <IconButton
                        color="success"
                        onClick={() => handleApproveAction(action.id)}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        color="error"
                        onClick={() => handleRejectAction(action.id)}
                      >
                        <ThumbDownIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Execute Agent Dialog */}
      <Dialog open={executeDialogOpen} onClose={() => setExecuteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Execute {selectedAgent?.agent_name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Goal"
            fullWidth
            multiline
            rows={3}
            value={executionGoal}
            onChange={(e) => setExecutionGoal(e.target.value)}
            placeholder="Describe what you want the agent to accomplish..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecuteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExecuteSubmit} variant="contained" disabled={!executionGoal}>
            Execute
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Plan Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Plan Details</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPlan.goal}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedPlan.status}
                    color={getStatusColor(selectedPlan.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Risk Level
                  </Typography>
                  <Chip
                    label={selectedPlan.risk_level}
                    color={getRiskLevelColor(selectedPlan.risk_level) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography>
                    {selectedPlan.completed_steps}/{selectedPlan.total_steps} steps completed
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Requires Approval
                  </Typography>
                  <Typography>
                    {selectedPlan.requires_approval ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}