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

  const getRiskColor = (riskLevel: ActionPlan['riskLevel']) => {
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
    if (step.status === 'executing' || step.status === 'in_progress') return 'active';
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
          executedSteps: result.execution.executed_steps
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

  const progress = (localPlan.completedSteps / localPlan.totalSteps) * 100;

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.default', border: 2, borderColor: getRiskColor(localPlan.riskLevel) + '.main' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {localPlan.goal}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {localPlan.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={localPlan.riskLevel.toUpperCase()}
              color={getRiskColor(localPlan.riskLevel)}
              size="small"
            />
            <Chip label={localPlan.status} color={getStatusColor(localPlan.status)} size="small" />
          </Box>
        </Box>

        {/* Progress bar */}
        {localPlan.status === 'executing' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {localPlan.completedSteps}/{localPlan.totalSteps} steps
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {localPlan.totalSteps} step{localPlan.totalSteps > 1 ? 's' : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ~{(localPlan.estimatedTotalDurationMs / 1000).toFixed(0)}s estimated
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Confidence: {Math.round(localPlan.confidenceScore * 100)}%
          </Typography>
        </Box>

        {/* Action buttons */}
        {localPlan.requiresApproval && (localPlan.status === 'pending' || localPlan.status === 'draft') && (
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
        {localPlan.status === 'approved' &&
         !localPlan.requiresApproval &&
         (!localPlan.executedSteps || localPlan.executedSteps.length === 0) && (
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
        {localPlan.executedSteps && localPlan.executedSteps.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="success" icon={<CheckIcon />}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                ✅ Action completed successfully!
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                Execution Summary:
              </Typography>
              {localPlan.executedSteps.map((step: any, idx: number) => (
                <Typography key={idx} variant="caption" sx={{ display: 'block' }}>
                  {step.success ? '✅' : '❌'} {step.action_name || step.actionName}
                  {!step.success && step.error && ` - Error: ${step.error}`}
                </Typography>
              ))}
            </Alert>
          </Box>
        )}

        {/* Show details toggle */}
        <Button
          size="small"
          onClick={() => setShowDetails(!showDetails)}
          endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mb: showDetails ? 2 : 0 }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>

        {/* Detailed steps */}
        <Collapse in={showDetails}>
          <Stepper orientation="vertical" activeStep={localPlan.completedSteps}>
            {localPlan.steps.map((step, index) => (
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
                    {step.actionName}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {step.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Integration: {step.targetIntegration} · Risk: {step.riskLevel}
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
        {localPlan.status === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Plan execution failed. Check step details above.
          </Alert>
        )}

        {/* Completed message */}
        {localPlan.status === 'completed' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Plan completed successfully! All {localPlan.totalSteps} steps executed.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
