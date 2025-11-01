'use client';

import { useState, useCallback } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import {
  ChatSession,
  SessionCategory,
  UseSessionsReturn,
} from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useSessions(userId: string, orgId: string): UseSessionsReturn {
  const {
    currentSession,
    setCurrentSession,
    sessions,
    setSessions,
    setMessages,
    addNotification,
  } = useChatContext();

  const [isLoading, setIsLoading] = useState(false);

  const loadSessions = useCallback(
    async (filter?: SessionCategory) => {
      try {
        setIsLoading(true);

        // Use the existing /chat/history endpoint
        const url = new URL(`${API_URL}/api/v1/chat/history`);
        url.searchParams.append('user_id', userId);
        url.searchParams.append('org_id', orgId);
        url.searchParams.append('limit', '50'); // Get more sessions

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Failed to load sessions: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform backend format to frontend format
        let sessions = (data.sessions || []).map((session: any) => ({
          id: session.id,
          userId: session.user_id,
          orgId: session.org_id,
          title: session.title || 'Untitled Session',
          status: 'active' as const,
          createdAt: session.created_at,
          updatedAt: session.updated_at || session.created_at,
          messageCount: session.message_count || 0, // Use backend message count
          category: 'general' as SessionCategory, // Default category
        }));

        // Filter by category if specified
        if (filter && filter !== 'all') {
          sessions = sessions.filter((s: any) => s.category === filter);
        }

        setSessions(sessions);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load sessions';
        console.error('Load sessions error:', errorMsg);

        // Don't show error notification on initial load, just log it
        // This allows the app to function even if sessions can't be loaded
        setSessions([]); // Set empty array so UI shows "no sessions" instead of error
      } finally {
        setIsLoading(false);
      }
    },
    [userId, orgId, setSessions, addNotification]
  );

  const selectSession = useCallback(
    async (sessionId: string) => {
      try {
        setIsLoading(true);

        // Load session messages
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

        // Find session in loaded sessions or create minimal session object
        const session = sessions.find((s) => s.id === sessionId) || {
          id: sessionId,
          userId,
          orgId,
          title: data.title || 'Session',
          status: 'active' as const,
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
          messageCount: data.messages?.length || 0,
        };

        setCurrentSession(session);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to select session';
        console.error('Select session error:', errorMsg);
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
    [userId, orgId, sessions, setMessages, setCurrentSession, addNotification]
  );

  const createSession = useCallback(
    async (title?: string, category?: SessionCategory): Promise<ChatSession> => {
      try {
        setIsLoading(true);

        // Sessions are automatically created by the backend when first message is sent
        // For now, just create a local session object and clear messages
        const newSession: ChatSession = {
          id: `temp-${Date.now()}`, // Temporary ID, will be replaced when first message is sent
          userId,
          orgId,
          title: title || 'New Session',
          status: 'active',
          category: category || 'general',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        };

        // Set as current session
        setCurrentSession(newSession);

        // Clear messages for new session
        setMessages([]);

        addNotification({
          type: 'success',
          title: 'New Chat Started',
          message: 'Session will be saved when you send your first message',
          duration: 3000,
        });

        return newSession;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
        console.error('Create session error:', errorMsg);
        addNotification({
          type: 'error',
          title: 'Session Creation Failed',
          message: errorMsg,
          duration: 5000,
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, orgId, setSessions, setCurrentSession, setMessages, addNotification]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        setIsLoading(true);

        // Use the existing DELETE endpoint (already exists in backend)
        const response = await fetch(`${API_URL}/api/v1/chat/${sessionId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete session: ${response.statusText}`);
        }

        // Remove from sessions list
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));

        // If deleted session was current, clear it
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }

        addNotification({
          type: 'success',
          title: 'Session Deleted',
          message: 'Session deleted successfully',
          duration: 3000,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete session';
        console.error('Delete session error:', errorMsg);
        addNotification({
          type: 'error',
          title: 'Session Deletion Failed',
          message: errorMsg,
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentSession, setSessions, setCurrentSession, setMessages, addNotification]
  );

  const archiveSession = useCallback(
    async (sessionId: string) => {
      try {
        setIsLoading(true);

        // Archive endpoint doesn't exist yet, so just delete it for now
        // This will be implemented later when the backend endpoint is added
        await deleteSession(sessionId);

        addNotification({
          type: 'info',
          title: 'Session Removed',
          message: 'Session has been removed (archive functionality coming soon)',
          duration: 3000,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to archive session';
        console.error('Archive session error:', errorMsg);
        addNotification({
          type: 'error',
          title: 'Session Archive Failed',
          message: errorMsg,
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, currentSession, deleteSession, addNotification]
  );

  return {
    sessions,
    currentSession,
    isLoading,
    loadSessions,
    selectSession,
    createSession,
    deleteSession,
    archiveSession,
  };
}
