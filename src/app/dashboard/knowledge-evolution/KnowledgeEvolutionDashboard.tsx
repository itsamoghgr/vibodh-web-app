'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Skeleton,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Psychology,
  AutoAwesome,
  Timeline,
  CompareArrows,
  Refresh,
  CheckCircle,
  Cancel,
  TrendingUp,
  Info,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetaRule {
  id: string;
  rule_text: string;
  category: string;
  confidence: number;
  application_count: number;
  success_rate: number;
  created_at: string;
  last_applied_at: string;
}

interface SchemaEvolution {
  id: string;
  change_type: string;
  old_value: string;
  new_value: string;
  reason: string;
  status: string;
  affected_count: number;
  created_at: string;
  metadata: any;
}

interface ModelSnapshot {
  id: string;
  snapshot_type: string;
  parameters_json: any;
  performance_metrics_json: any;
  created_at: string;
  notes: string;
}

interface TrendsData {
  trends_analysis: string;
  entity_growth: Array<{
    entity_type: string;
    total_count: number;
    recent_count: number;
    growth_rate: number;
  }>;
}

export default function KnowledgeEvolutionDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Data states
  const [metaRules, setMetaRules] = useState<MetaRule[]>([]);
  const [schemaEvolutions, setSchemaEvolutions] = useState<SchemaEvolution[]>([]);
  const [modelSnapshots, setModelSnapshots] = useState<ModelSnapshot[]>([]);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);

  // UI states
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });
  const [selectedEvolution, setSelectedEvolution] = useState<SchemaEvolution | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const supabase = createClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      // Load all data in parallel
      await Promise.all([
        loadMetaRules(profile.org_id),
        loadSchemaEvolutions(profile.org_id),
        loadModelSnapshots(profile.org_id),
        loadTrends(profile.org_id),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMetaRules = async (orgId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/meta-learning/rules?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setMetaRules(data.rules || []);
      }
    } catch (error) {
      console.error('Failed to load meta rules:', error);
    }
  };

  const loadSchemaEvolutions = async (orgId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/meta-learning/kg-evolution?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setSchemaEvolutions(data.evolutions || []);
      }
    } catch (error) {
      console.error('Failed to load schema evolutions:', error);
    }
  };

  const loadModelSnapshots = async (orgId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/meta-learning/snapshots?org_id=${orgId}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setModelSnapshots(data.snapshots || []);
      }
    } catch (error) {
      console.error('Failed to load model snapshots:', error);
    }
  };

  const loadTrends = async (orgId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/meta-learning/trends?org_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setTrendsData(data);
      }
    } catch (error) {
      console.error('Failed to load trends:', error);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      const response = await fetch(`${apiUrl}/api/v1/meta-learning/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: profile.org_id,
          days_back: 30,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(`Analysis complete: ${data.rules_discovered} rules discovered`, 'success');
        await loadAllData();
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Failed to run analysis:', error);
      showSnackbar('Failed to run meta-learning analysis', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApproveEvolution = async () => {
    if (!selectedEvolution) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      const response = await fetch(`${apiUrl}/api/v1/meta-learning/kg-evolution/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: profile.org_id,
          evolution_id: selectedEvolution.id,
          approved_by: user.id,
        }),
      });

      if (response.ok) {
        showSnackbar('Schema evolution approved', 'success');
        await loadSchemaEvolutions(profile.org_id);
      } else {
        throw new Error('Approval failed');
      }
    } catch (error) {
      console.error('Failed to approve evolution:', error);
      showSnackbar('Failed to approve schema evolution', 'error');
    } finally {
      setApproveDialogOpen(false);
      setSelectedEvolution(null);
    }
  };

  const handleRejectEvolution = async () => {
    if (!selectedEvolution) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      const response = await fetch(`${apiUrl}/api/v1/meta-learning/kg-evolution/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: profile.org_id,
          evolution_id: selectedEvolution.id,
          approved_by: user.id,
        }),
      });

      if (response.ok) {
        showSnackbar('Schema evolution rejected', 'success');
        await loadSchemaEvolutions(profile.org_id);
      } else {
        throw new Error('Rejection failed');
      }
    } catch (error) {
      console.error('Failed to reject evolution:', error);
      showSnackbar('Failed to reject schema evolution', 'error');
    } finally {
      setRejectDialogOpen(false);
      setSelectedEvolution(null);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'warning';
      case 'approved':
      case 'applied':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Knowledge Evolution
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Meta-learning insights, reasoning patterns, and Knowledge Graph evolution
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Psychology />}
          onClick={handleRunAnalysis}
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Run Meta-Learning'}
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<AutoAwesome />} label="Meta Rules" />
          <Tab icon={<CompareArrows />} label="Schema Evolution" />
          <Tab icon={<Timeline />} label="Model Snapshots" />
          <Tab icon={<TrendingUp />} label="Trends & Patterns" />
        </Tabs>
      </Box>

      {/* Tab 1: Meta Rules */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Discovered Reasoning Rules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Meta-rules learned from analyzing reasoning patterns and performance
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rule</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Success Rate</TableCell>
                    <TableCell>Applied</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metaRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">
                          No meta-rules discovered yet. Run meta-learning analysis to generate rules.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    metaRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <Typography variant="body2">{rule.rule_text}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={rule.category} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${(rule.confidence * 100).toFixed(0)}%`}
                            size="small"
                            color={rule.confidence >= 0.8 ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${(rule.success_rate * 100).toFixed(0)}%`}
                            size="small"
                            color={rule.success_rate >= 0.7 ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{rule.application_count}×</TableCell>
                        <TableCell>
                          <Typography variant="caption">{formatDate(rule.created_at)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Schema Evolution */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Knowledge Graph Schema Evolution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Proposed and applied changes to entity and relation types
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Change Type</TableCell>
                    <TableCell>New Value</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schemaEvolutions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">
                          No schema evolutions proposed yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schemaEvolutions.map((evolution) => (
                      <TableRow key={evolution.id}>
                        <TableCell>
                          <Chip label={evolution.change_type.replace(/_/g, ' ')} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {evolution.new_value}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{evolution.reason}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={evolution.status}
                            size="small"
                            color={getStatusColor(evolution.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{formatDate(evolution.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          {evolution.status === 'proposed' && (
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setSelectedEvolution(evolution);
                                    setApproveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedEvolution(evolution);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Model Snapshots */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Model Configuration Snapshots
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Historical snapshots of AI model parameters and performance
            </Typography>

            {modelSnapshots.length === 0 ? (
              <Typography color="text.secondary" align="center">
                No snapshots available yet.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {modelSnapshots.map((snapshot) => (
                  <Paper key={snapshot.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {snapshot.snapshot_type.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="caption">{formatDate(snapshot.created_at)}</Typography>
                    </Box>

                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Parameters
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          {Object.entries(snapshot.parameters_json || {}).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Performance
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          {Object.entries(snapshot.performance_metrics_json || {}).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${typeof value === 'number' ? value.toFixed(0) : value}`}
                              size="small"
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>

                    {snapshot.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {snapshot.notes}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Trends & Patterns */}
      {tabValue === 3 && (
        <Stack spacing={3}>
          {/* Entity Growth Chart */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Entity Type Growth
              </Typography>
              {trendsData?.entity_growth && trendsData.entity_growth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendsData.entity_growth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="entity_type" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="total_count" fill="#8884d8" name="Total" />
                    <Bar dataKey="recent_count" fill="#82ca9d" name="Recent (30d)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No entity growth data available</Typography>
              )}
            </CardContent>
          </Card>

          {/* Trends Analysis */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trends Analysis
              </Typography>
              {trendsData?.trends_analysis ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {trendsData.trends_analysis}
                </Typography>
              ) : (
                <Typography color="text.secondary">
                  No trend analysis available. Run meta-learning to generate insights.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Schema Evolution?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedEvolution && (
              <>
                Are you sure you want to approve this schema change?
                <br />
                <br />
                <strong>Type:</strong> {selectedEvolution.change_type}
                <br />
                <strong>New Value:</strong> {selectedEvolution.new_value}
                <br />
                <strong>Reason:</strong> {selectedEvolution.reason}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApproveEvolution} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Schema Evolution?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedEvolution && (
              <>
                Are you sure you want to reject this schema change?
                <br />
                <br />
                <strong>Type:</strong> {selectedEvolution.change_type}
                <br />
                <strong>New Value:</strong> {selectedEvolution.new_value}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectEvolution} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
