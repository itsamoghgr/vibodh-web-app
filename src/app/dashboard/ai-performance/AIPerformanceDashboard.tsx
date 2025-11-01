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
  LinearProgress,
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
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  ThumbUp,
  Psychology,
  Refresh,
  AutoMode,
  Timeline,
  Assessment,
} from '@mui/icons-material';

interface PerformanceSummary {
  summary: {
    total_interactions: number;
    positive_feedback: number;
    negative_feedback: number;
    avg_confidence: number;
    avg_response_time: number;
    avg_accuracy: number;
  };
  module_stats: Array<{
    module_name: string;
    total_uses: number;
    success_rate: number;
    avg_response_time: number;
  }>;
  response_times: Array<{
    intent: string;
    avg_response_time_ms: number;
  }>;
  recommendations: Array<{
    type: string;
    priority: string;
    description: string;
  }>;
}

interface AdaptiveConfig {
  rag_weight: number;
  kg_weight: number;
  memory_weight: number;
  insight_weight: number;
  llm_temperature: number;
  max_context_items: number;
  last_optimized_at: string;
  optimization_count: number;
}

interface OptimizationLog {
  id: string;
  parameter_name: string;
  old_value: number;
  new_value: number;
  reason: string;
  created_at: string;
  optimization_type: string;
}

export default function AIPerformanceDashboard() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [config, setConfig] = useState<AdaptiveConfig | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const supabase = createClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      // Load performance summary
      const summaryRes = await fetch(
        `${apiUrl}/api/v1/adaptive/performance/summary/${profile.org_id}?days_back=7`
      );
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData);
      }

      // Load adaptive config
      const configRes = await fetch(`${apiUrl}/api/v1/adaptive/config/${profile.org_id}`);
      const configData = await configRes.json();
      if (configData.success) {
        setConfig(configData.config);
      }

      // Load optimization history
      const historyRes = await fetch(
        `${apiUrl}/api/v1/adaptive/optimization/history/${profile.org_id}?limit=10`
      );
      const historyData = await historyRes.json();
      if (historyData.success) {
        setOptimizationHistory(historyData.history);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load performance data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunOptimization = async () => {
    setOptimizing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile?.org_id) return;

      setSnackbar({
        open: true,
        message: 'Running optimization...',
        severity: 'info',
      });

      const response = await fetch(`${apiUrl}/api/v1/adaptive/optimize/${profile.org_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days_back: 7,
          dry_run: false
        })
      });

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: 'Optimization completed successfully',
          severity: 'success',
        });
        loadData();
      }
    } catch (error) {
      console.error('Error running optimization:', error);
      setSnackbar({
        open: true,
        message: 'Failed to run optimization',
        severity: 'error',
      });
    } finally {
      setOptimizing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessRate = () => {
    if (!summary?.summary) return 0;
    const { positive_feedback, total_interactions } = summary.summary;
    return total_interactions > 0 ? (positive_feedback / total_interactions) * 100 : 0;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={60} />
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={120} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Assessment sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight="bold">
              AI Performance
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor and optimize AI reasoning performance
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoMode />}
            onClick={handleRunOptimization}
            disabled={optimizing}
          >
            {optimizing ? 'Optimizing...' : 'Run Optimization'}
          </Button>
        </Stack>
      </Stack>

      {/* Metrics */}
      {summary && (
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {getSuccessRate().toFixed(1)}%
                    </Typography>
                  </Box>
                  <ThumbUp color="success" />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={getSuccessRate()}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  color={getSuccessRate() > 70 ? 'success' : 'warning'}
                />
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Avg Response Time
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.summary.avg_response_time?.toFixed(0) || 0}ms
                    </Typography>
                  </Box>
                  <Speed color="primary" />
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Avg Accuracy
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {((summary.summary.avg_accuracy || 0) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <TrendingUp color="secondary" />
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Queries
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {summary.summary.total_interactions || 0}
                    </Typography>
                  </Box>
                  <Timeline color="info" />
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Module Performance" />
          <Tab label="Adaptive Config" />
          <Tab label="Optimization History" />
          <Tab label="Recommendations" />
        </Tabs>
      </Card>

      {/* Tab Panels */}
      {tabValue === 0 && summary && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Module Performance (Last 7 Days)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Module</TableCell>
                    <TableCell align="right">Uses</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Avg Response Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.module_stats.map((module) => (
                    <TableRow key={module.module_name}>
                      <TableCell>
                        <Chip
                          label={module.module_name}
                          size="small"
                          color={module.success_rate > 0.7 ? 'success' : module.success_rate > 0.5 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="right">{module.total_uses}</TableCell>
                      <TableCell align="right">
                        {(module.success_rate * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {module.avg_response_time?.toFixed(0) || 0}ms
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && config && (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Current Adaptive Configuration
              </Typography>
              <Chip
                label={`${config.optimization_count} optimizations`}
                size="small"
                icon={<AutoMode />}
              />
            </Stack>

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Module Weights
                </Typography>
                <Stack spacing={2}>
                  {[
                    { name: 'RAG', value: config.rag_weight },
                    { name: 'Knowledge Graph', value: config.kg_weight },
                    { name: 'Memory', value: config.memory_weight },
                    { name: 'Insights', value: config.insight_weight },
                  ].map((item) => (
                    <Box key={item.name}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{item.name}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.value.toFixed(2)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(item.value / 2) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  LLM Parameters
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Temperature
                    </Typography>
                    <Typography variant="h6">{config.llm_temperature.toFixed(2)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Max Context Items
                    </Typography>
                    <Typography variant="h6">{config.max_context_items}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Optimized
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(config.last_optimized_at)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Optimizations
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Change</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {optimizationHistory.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.parameter_name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{log.old_value.toFixed(2)}</Typography>
                          <Typography variant="body2">→</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {log.new_value.toFixed(2)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 400 }}>
                          {log.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 3 && summary && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Optimization Recommendations
            </Typography>
            {summary.recommendations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Psychology sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  System is performing optimally. No recommendations at this time.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {summary.recommendations.map((rec, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Chip
                              label={rec.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={rec.priority}
                              size="small"
                              color={rec.priority === 'high' ? 'error' : 'warning'}
                            />
                          </Stack>
                          <Typography variant="body2">
                            {rec.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
