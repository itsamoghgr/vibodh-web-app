'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Description as DocumentIcon,
  Hub as GraphIcon,
  Memory as MemoryIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useChatContext } from '@/contexts/ChatContext';
import { ContextItem, ActionPlan, Task } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

export default function ContextDrawer() {
  const { contextDrawer } = useChatContext();

  const getContextIcon = (type: ContextItem['type']) => {
    switch (type) {
      case 'document':
        return <DocumentIcon fontSize="small" />;
      case 'knowledge_graph':
        return <GraphIcon fontSize="small" />;
      case 'conversation':
        return <MemoryIcon fontSize="small" />;
      default:
        return <DocumentIcon fontSize="small" />;
    }
  };

  const getRiskChipColor = (riskLevel: ActionPlan['riskLevel']) => {
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

  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckIcon fontSize="small" color="success" />;
      case 'in_progress':
        return <ScheduleIcon fontSize="small" color="primary" />;
      case 'failed':
        return <ErrorIcon fontSize="small" color="error" />;
      default:
        return <ScheduleIcon fontSize="small" color="disabled" />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Context
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Active modules and recent activity
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Active Modules */}
        {contextDrawer.activeModules.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Active Modules
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {contextDrawer.activeModules.map((module) => (
                <Chip key={module} label={module} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Recent Sources */}
        {contextDrawer.recentSources.length > 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Recent Sources ({contextDrawer.recentSources.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense disablePadding>
                {contextDrawer.recentSources.map((source) => (
                  <ListItem key={source.id} sx={{ px: 2, py: 1 }}>
                    <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                      {getContextIcon(source.type)}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {source.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {source.snippet}
                        </Typography>
                      }
                    />
                    {source.score && (
                      <Chip
                        label={`${Math.round(source.score * 100)}%`}
                        size="small"
                        sx={{ ml: 1, height: 20, fontSize: 10 }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Recent Plans */}
        {contextDrawer.recentPlans.length > 0 && (
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Recent Plans ({contextDrawer.recentPlans.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {contextDrawer.recentPlans.map((plan) => (
                  <Card key={plan.id} variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {plan.goal}
                        </Typography>
                        <Chip
                          label={plan.riskLevel}
                          size="small"
                          color={getRiskChipColor(plan.riskLevel)}
                          sx={{ height: 18, fontSize: 10 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {plan.totalSteps} steps · {plan.status}
                      </Typography>
                      {plan.completedSteps > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(plan.completedSteps / plan.totalSteps) * 100}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Active Tasks */}
        {contextDrawer.activeTasks.length > 0 && (
          <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Active Tasks ({contextDrawer.activeTasks.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense disablePadding>
                {contextDrawer.activeTasks.map((task) => (
                  <ListItem key={task.id} sx={{ px: 2, py: 1 }}>
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      {getTaskStatusIcon(task.status)}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {task.description}
                          </Typography>
                          {task.status === 'in_progress' && (
                            <Box sx={{ mt: 0.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={task.progress}
                                sx={{ height: 3, borderRadius: 2 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {task.progress}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Empty state */}
        {contextDrawer.recentSources.length === 0 &&
          contextDrawer.recentPlans.length === 0 &&
          contextDrawer.activeTasks.length === 0 &&
          contextDrawer.activeModules.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No active context yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Start a conversation to see relevant information here
              </Typography>
            </Box>
          )}
      </Box>
    </Box>
  );
}
