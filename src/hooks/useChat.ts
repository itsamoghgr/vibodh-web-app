'use client';

import { useCallback } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import {
  ChatMessage,
  TextMessage,
  ActionPlanMessage,
  InsightMessage,
  TaskMessage,
  SystemEventMessage,
  ReflectionMessage,
  StreamEvent,
  UseChatReturn,
} from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useChat(userId: string, orgId: string): UseChatReturn {
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    currentSession,
    setCurrentSession,
    isLoading,
    setIsLoading,
    isStreaming,
    setIsStreaming,
    setAgentIntelligence,
    setContextDrawer,
    addNotification,
    error,
    setError,
  } = useChatContext();

  const loadSession = useCallback(
    async (sessionId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/v1/chat/${sessionId}`);
        if (!response.ok) {
          throw new Error(`Failed to load session: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform backend messages to frontend format
        const transformedMessages = (data.messages || []).map((msg: any) => {
          const baseMessage = {
            id: msg.id,
            sessionId: msg.session_id || sessionId,
            role: msg.role,
            type: msg.metadata?.message_type || 'text', // Read from metadata JSONB
            content: msg.content || '',
            createdAt: msg.created_at || new Date().toISOString(),
            context: msg.context || [],
          };

          // If it's an action plan message, include the action plan data
          if (msg.metadata?.message_type === 'action_plan') {
            return {
              ...baseMessage,
              actionPlan: {
                id: msg.metadata.plan_id,
                agentType: msg.metadata.agent_type || 'communication',
                goal: msg.metadata.goal || '',
                steps: [],
                riskLevel: msg.metadata.risk_level || 'low',
                requiresApproval: msg.metadata.requires_approval || false,
                status: msg.metadata.executed_steps?.length > 0 ? 'completed' : 'approved',
                totalSteps: msg.metadata.total_steps || 0,
                completedSteps: msg.metadata.executed_steps?.length || 0,
                executedSteps: msg.metadata.executed_steps || [],
                confidenceScore: 0.9,
                estimatedTotalDurationMs: 5000,
                createdAt: msg.created_at,
              }
            };
          }

          return baseMessage;
        });

        setMessages(transformedMessages);
        setCurrentSession({
          id: sessionId,
          userId,
          orgId,
          title: data.title || 'Untitled Session',
          status: 'active',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
          messageCount: transformedMessages.length,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load session';
        setError(errorMsg);
        addNotification({
          type: 'error',
          title: 'Session Load Failed',
          message: errorMsg,
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, orgId, setMessages, setCurrentSession, setIsLoading, setError, addNotification]
  );

  const createNewSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear current messages
      setMessages([]);
      setCurrentSession(null);

      addNotification({
        type: 'success',
        title: 'New Session Created',
        message: 'Ready to chat!',
        duration: 3000,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMsg);
      addNotification({
        type: 'error',
        title: 'Session Creation Failed',
        message: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [setMessages, setCurrentSession, setIsLoading, setError, addNotification]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || isStreaming) return;

      let assistantMessageId: string | null = null;

      try {
        setIsLoading(true);
        setIsStreaming(true);
        setError(null);

        // Add user message
        const userMessage: TextMessage = {
          id: `msg-${Date.now()}`,
          sessionId: currentSession?.id || 'temp',
          role: 'user',
          type: 'text',
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };
        addMessage(userMessage);

        // Create assistant message placeholder
        assistantMessageId = `msg-${Date.now() + 1}`;
        let assistantMessage: ChatMessage = {
          id: assistantMessageId,
          sessionId: currentSession?.id || 'temp',
          role: 'assistant',
          type: 'text',
          content: '',
          createdAt: new Date().toISOString(),
          context: [],
        } as TextMessage;

        addMessage(assistantMessage);

        // Start streaming
        // Don't send temporary session IDs to the backend
        const sessionIdToSend = currentSession?.id?.startsWith('temp-') ? undefined : currentSession?.id;

        const response = await fetch(`${API_URL}/api/v1/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: content,
            org_id: orgId,
            user_id: userId,
            session_id: sessionIdToSend,
            max_context_items: 5,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event: StreamEvent = JSON.parse(line.slice(6));
                await handleStreamEvent(event, assistantMessage, assistantMessageId);
              } catch (parseError) {
                console.error('Failed to parse stream event:', parseError);
              }
            }
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMsg);
        addNotification({
          type: 'error',
          title: 'Message Failed',
          message: errorMsg,
          duration: 5000,
        });

        // Update assistant message with error
        if (assistantMessageId) {
          updateMessage(assistantMessageId, {
            content: 'Sorry, I encountered an error. Please try again.',
          });
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [
      userId,
      orgId,
      currentSession,
      isLoading,
      isStreaming,
      addMessage,
      updateMessage,
      setIsLoading,
      setIsStreaming,
      setError,
      addNotification,
    ]
  );

  const handleStreamEvent = async (
    event: StreamEvent,
    assistantMessage: ChatMessage,
    messageId: string
  ) => {
    switch (event.type) {
      case 'session':
        if (event.sessionId && !currentSession) {
          setCurrentSession({
            id: event.sessionId,
            userId,
            orgId,
            title: 'New Session',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 1,
          });
        }
        break;

      case 'context':
        if (event.context) {
          updateMessage(messageId, {
            context: event.context,
          });

          // Update context drawer
          setContextDrawer((prev) => ({
            ...prev,
            recentSources: event.context || [],
          }));
        }
        break;

      case 'token':
        if (event.content) {
          assistantMessage.content += event.content;
          updateMessage(messageId, {
            content: assistantMessage.content,
          });
        }
        break;

      case 'action_plan':
        if (event.actionPlan) {
          // Convert to ActionPlanMessage
          const actionPlanMsg: ActionPlanMessage = {
            ...assistantMessage,
            type: 'action_plan',
            actionPlan: event.actionPlan,
          } as ActionPlanMessage;

          updateMessage(messageId, actionPlanMsg);

          // Update context drawer
          setContextDrawer((prev) => ({
            ...prev,
            recentPlans: [event.actionPlan!, ...prev.recentPlans.slice(0, 4)],
          }));

          // Show notification for high-risk actions
          if (event.actionPlan.risk_level === 'high' || event.actionPlan.risk_level === 'critical') {
            addNotification({
              type: 'warning',
              title: 'Action Approval Required',
              message: `${event.actionPlan.risk_level.toUpperCase()} risk action plan requires your approval`,
              duration: 0, // Manual dismiss
            });
          }
        }
        break;

      case 'insight':
        if (event.insight) {
          const insightMsg: InsightMessage = {
            ...assistantMessage,
            type: 'insight',
            insight: event.insight,
          } as InsightMessage;
          updateMessage(messageId, insightMsg);
        }
        break;

      case 'task_update':
        if (event.task) {
          const taskMsg: TaskMessage = {
            ...assistantMessage,
            type: 'task',
            task: event.task,
          } as TaskMessage;
          updateMessage(messageId, taskMsg);

          // Update context drawer
          setContextDrawer((prev) => ({
            ...prev,
            activeTasks: [event.task!, ...prev.activeTasks.filter((t) => t.id !== event.task!.id)],
          }));
        }
        break;

      case 'system_event':
        if (event.systemEvent) {
          const eventMsg: SystemEventMessage = {
            ...assistantMessage,
            type: 'system_event',
            event: event.systemEvent,
          } as SystemEventMessage;
          updateMessage(messageId, eventMsg);

          // Show notification for important events
          if (event.systemEvent.severity === 'error' || event.systemEvent.severity === 'warning') {
            addNotification({
              type: event.systemEvent.severity === 'error' ? 'error' : 'warning',
              title: event.systemEvent.title,
              message: event.systemEvent.description,
              duration: 5000,
            });
          }
        }
        break;

      case 'reflection':
        if (event.reflection) {
          const reflectionMsg: ReflectionMessage = {
            ...assistantMessage,
            type: 'reflection',
            reflection: event.reflection,
          } as ReflectionMessage;
          updateMessage(messageId, reflectionMsg);
        }
        break;

      case 'done':
        setIsStreaming(false);
        break;

      case 'error':
        setError(event.error || 'Unknown error occurred');
        addNotification({
          type: 'error',
          title: 'Stream Error',
          message: event.error || 'Unknown error occurred',
          duration: 5000,
        });
        break;

      default:
        console.warn('Unknown stream event type:', event.type);
    }
  };

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return {
    messages,
    sessionId: currentSession?.id || null,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    loadSession,
    createNewSession,
    clearMessages,
  };
}
