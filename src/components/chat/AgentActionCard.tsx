'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { ActionPlan, ActionStep, ActionCardProps } from '@/types/chat';

interface AgentActionCardInternalProps {
  actionPlan: ActionPlan;
  userId: string;
  orgId: string;
}

export default function AgentActionCard({ actionPlan, userId, orgId }: AgentActionCardInternalProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [localPlan, setLocalPlan] = useState(actionPlan);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailedPlan, setDetailedPlan] = useState<ActionPlan | null>(null);

  const getRiskColor = (riskLevel: ActionPlan['risk_level']) => {
    switch (riskLevel) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: ActionPlan['status']) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending':
      case 'pending_approval':  // Handle backend status format
        return 'warning';
      case 'approved':
        return 'info';
      case 'executing':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStepStatus = (step: ActionStep) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'executing') return 'active';
    if (step.status === 'failed') return 'error';
    return 'pending';
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = new URL(`${apiUrl}/api/v1/agents/plans/${localPlan.id}/approve`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('user_id', userId);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true, execute: true }),
      });

      if (!response.ok) throw new Error('Failed to approve plan');

      const result = await response.json();

      // Update plan with execution results
      if (result.execution?.executed_steps) {
        setLocalPlan({
          ...localPlan,
          status: 'completed',
          executed_steps: result.execution.executed_steps
        });
      } else {
        setLocalPlan({ ...localPlan, status: 'approved' });
      }
    } catch (error) {
      console.error('Failed to approve plan:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = new URL(`${apiUrl}/api/v1/agents/plans/${localPlan.id}/approve`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('user_id', userId);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false, reason: 'Rejected by user' }),
      });

      if (!response.ok) throw new Error('Failed to reject plan');

      setLocalPlan({ ...localPlan, status: 'cancelled' });
    } catch (error) {
      console.error('Failed to reject plan:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/agents/plans/${localPlan.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to execute plan');

      setLocalPlan({ ...localPlan, status: 'executing' });
    } catch (error) {
      console.error('Failed to execute plan:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const fetchPlanDetails = async () => {
    if (detailedPlan) return; // Already fetched

    try {
      setIsLoadingDetails(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = new URL(`${apiUrl}/api/v1/agents/plans/${localPlan.id}`);
      url.searchParams.append('org_id', orgId);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch plan details');

      const data = await response.json();
      setDetailedPlan(data);
      setLocalPlan(data); // Update local plan with full details
    } catch (error) {
      console.error('Failed to fetch plan details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleToggleDetails = async () => {
    if (!showDetails && !detailedPlan) {
      // Fetch details when expanding for the first time
      await fetchPlanDetails();
    }
    setShowDetails(!showDetails);
  };

  // Safe defaults for potentially undefined values
  const safeRiskLevel = localPlan.risk_level || 'medium';
  const safeStatus = localPlan.status || 'pending';
  const safeTotalSteps = localPlan.total_steps || 0;
  const safeCompletedSteps = localPlan.completed_steps || 0;
  const safeSteps = localPlan.steps || [];

  const progress = safeTotalSteps > 0 ? (safeCompletedSteps / safeTotalSteps) * 100 : 0;
  const planToDisplay = detailedPlan || localPlan;

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.default', border: 2, borderColor: getRiskColor(safeRiskLevel) + '.main' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {localPlan.goal || 'Untitled Plan'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {localPlan.description || 'No description'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={safeRiskLevel.toUpperCase()}
              color={getRiskColor(safeRiskLevel)}
              size="small"
            />
            <Chip label={safeStatus} color={getStatusColor(safeStatus)} size="small" />
          </Box>
        </Box>

        {/* Progress bar */}
        {safeStatus === 'executing' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {safeCompletedSteps}/{safeTotalSteps} steps
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {safeTotalSteps} step{safeTotalSteps > 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ~{localPlan.estimated_total_duration_ms ? (localPlan.estimated_total_duration_ms / 1000).toFixed(0) : '?'}s estimated
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Confidence: {localPlan.confidence_score ? Math.round(localPlan.confidence_score * 100) : '?'}%
          </Typography>
        </Box>

        {/* Action buttons */}
        {localPlan.requires_approval && (safeStatus === 'pending' || safeStatus === 'pending_approval' || safeStatus === 'draft') && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={isApproving ? <CircularProgress size={16} /> : <CheckIcon />}
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              size="small"
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={isRejecting ? <CircularProgress size={16} /> : <CloseIcon />}
              onClick={handleReject}
              disabled={isApproving || isRejecting}
              size="small"
            >
              Reject
            </Button>
          </Box>
        )}

        {/* Show Run button only if not already executed */}
        {safeStatus === 'approved' &&
         !localPlan.requires_approval &&
         (!localPlan.executed_steps || localPlan.executed_steps.length === 0) && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={isRunning ? <CircularProgress size={16} /> : <PlayIcon />}
              onClick={handleRun}
              disabled={isRunning}
              size="small"
            >
              Run
            </Button>
          </Box>
        )}

        {/* Show execution results if plan has been executed */}
        {localPlan.executed_steps && localPlan.executed_steps.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="success" icon={<CheckIcon />}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                ✅ Action completed successfully!
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                Execution Summary:
              </Typography>
              {localPlan.executed_steps.map((step: any, idx: number) => (
                <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                  {step.success ? '✅' : '❌'} {step.action_name}
                  {!step.success && step.error && ` - Error: ${step.error}`}
                </Typography>
              ))}
            </Alert>
          </Box>
        )}

        {/* Show details toggle */}
        <Button
          size="small"
          onClick={handleToggleDetails}
          endIcon={
            isLoadingDetails ? <CircularProgress size={16} /> :
            showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />
          }
          disabled={isLoadingDetails}
          sx={{ mb: showDetails ? 2 : 0 }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>

        {/* Detailed steps */}
        <Collapse in={showDetails}>
          {planToDisplay.context && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Context & Reasoning
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Intent:</strong> {planToDisplay.context.intent || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Topic:</strong> {planToDisplay.context.topic || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Urgency:</strong> {planToDisplay.context.urgency ? Math.round(planToDisplay.context.urgency * 100) + '%' : 'N/A'}
              </Typography>
              {planToDisplay.context.reasoning && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  <strong>Reasoning:</strong> {planToDisplay.context.reasoning}
                </Typography>
              )}
              {planToDisplay.context.channels && planToDisplay.context.channels.length > 0 && (
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>Channels:</strong> {planToDisplay.context.channels.join(', ')}
                </Typography>
              )}
            </Box>
          )}
          <Stepper orientation="vertical" activeStep={planToDisplay.completed_steps || 0}>
            {(planToDisplay.steps || []).map((step, index) => (
              <Step key={index} completed={step.status === 'completed'}>
                <StepLabel
                  error={step.status === 'failed'}
                  icon={
                    step.status === 'failed' ? (
                      <ErrorIcon color="error" />
                    ) : step.status === 'executing' ? (
                      <ScheduleIcon color="primary" />
                    ) : undefined
                  }
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {step.action_name}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {step.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Integration: {step.target_integration} · Risk: {step.risk_level}
                  </Typography>
                  {step.error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {step.error}
                    </Alert>
                  )}
                  {step.result && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      Completed successfully
                    </Alert>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Collapse>

        {/* Error message */}
        {safeStatus === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Plan execution failed. Check step details above.
          </Alert>
        )}

        {/* Completed message */}
        {safeStatus === 'completed' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Plan completed successfully! All {safeTotalSteps} steps executed.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
