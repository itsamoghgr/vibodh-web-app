'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  ChatMessage,
  TextMessage,
  ActionPlanMessage,
  InsightMessage,
  TaskMessage,
  SystemEventMessage,
  ReflectionMessage,
  ChatMessageCardProps,
} from '@/types/chat';
import AgentTag from './AgentTag';
import ContextIndicator from './ContextIndicator';
import { formatDistanceToNow } from 'date-fns';

// Import the specialized card components (to be created)
import AgentActionCard from './AgentActionCard';
import InsightCard from './InsightCard';
import TaskCard from './TaskCard';
import SystemEventCard from './SystemEventCard';
import ReflectionCard from './ReflectionCard';

interface ExtendedChatMessageCardProps extends ChatMessageCardProps {
  userId: string;
  orgId: string;
}

export default function ChatMessageCard({ message, onFeedback, onRetry, userId, orgId }: ExtendedChatMessageCardProps) {
  const [showContext, setShowContext] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleFeedback = (rating: 'positive' | 'negative') => {
    setFeedback(rating);
    if (onFeedback) {
      onFeedback(message.id, rating);
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </Typography>
        );

      case 'action_plan':
        const actionPlanMsg = message as ActionPlanMessage;
        return <AgentActionCard actionPlan={actionPlanMsg.actionPlan} userId={userId} orgId={orgId} />;

      case 'insight':
        const insightMsg = message as InsightMessage;
        return <InsightCard insight={insightMsg.insight} />;

      case 'task':
        const taskMsg = message as TaskMessage;
        return <TaskCard task={taskMsg.task} />;

      case 'system_event':
        const eventMsg = message as SystemEventMessage;
        return <SystemEventCard event={eventMsg.event} />;

      case 'reflection':
        const reflectionMsg = message as ReflectionMessage;
        return <ReflectionCard reflection={reflectionMsg.reflection} />;

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Unknown message type
          </Typography>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 2,
        mb: 3,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 36,
          height: 36,
        }}
      >
        {isUser ? <PersonIcon /> : <BotIcon />}
      </Avatar>

      {/* Message Content */}
      <Box sx={{ flex: 1, maxWidth: '80%' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.50' : 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          {/* Header with agent tags and context indicator */}
          {isAssistant && message.agentIntelligence && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
              <AgentTag capabilities={message.agentIntelligence.capabilities} size="small" />
              <Box sx={{ ml: 'auto' }}>
                <ContextIndicator
                  agentIntelligence={message.agentIntelligence}
                  contextItems={message.context}
                />
              </Box>
            </Box>
          )}

          {/* Message content */}
          {renderMessageContent()}

          {/* Timestamp */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {message.createdAt && !isNaN(new Date(message.createdAt).getTime())
              ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
              : 'just now'}
          </Typography>
        </Paper>

        {/* Context sources (collapsible) */}
        {isAssistant && message.context && message.context.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <IconButton
              size="small"
              onClick={() => setShowContext(!showContext)}
              sx={{ color: 'text.secondary' }}
            >
              {showContext ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {message.context.length} source{message.context.length > 1 ? 's' : ''}
              </Typography>
            </IconButton>

            <Collapse in={showContext}>
              <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'background.default' }}>
                {message.context && message.context.map((ctx, index) => (
                  <Box key={ctx.id || `context-${message.id}-${index}`} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {ctx.title}
                    </Typography>
                    {ctx.snippet && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {ctx.snippet}
                      </Typography>
                    )}
                    {ctx.score && (
                      <Typography variant="caption" color="primary" display="block">
                        Relevance: {Math.round(ctx.score * 100)}%
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            </Collapse>
          </Box>
        )}

        {/* Feedback buttons */}
        {isAssistant && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleFeedback('positive')}
              sx={{
                color: feedback === 'positive' ? 'success.main' : 'text.secondary',
              }}
            >
              <ThumbUpIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleFeedback('negative')}
              sx={{
                color: feedback === 'negative' ? 'error.main' : 'text.secondary',
              }}
            >
              <ThumbDownIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
