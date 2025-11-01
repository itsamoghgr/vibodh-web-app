'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  ChatMessage,
  ChatSession,
  AgentIntelligence,
  Notification,
  ChatContextDrawer,
} from '@/types/chat';

interface ChatContextType {
  // Messages
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  // Session
  currentSession: ChatSession | null;
  setCurrentSession: React.Dispatch<React.SetStateAction<ChatSession | null>>;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;

  // Loading states
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;

  // Agent intelligence
  agentIntelligence: AgentIntelligence | null;
  setAgentIntelligence: React.Dispatch<React.SetStateAction<AgentIntelligence | null>>;

  // Context drawer
  contextDrawer: ChatContextDrawer;
  setContextDrawer: React.Dispatch<React.SetStateAction<ChatContextDrawer>>;
  toggleContextDrawer: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Error handling
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  // Message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Agent intelligence
  const [agentIntelligence, setAgentIntelligence] = useState<AgentIntelligence | null>(null);

  // Context drawer
  const [contextDrawer, setContextDrawer] = useState<ChatContextDrawer>({
    isOpen: false,
    activeModules: [],
    recentSources: [],
    recentPlans: [],
    activeTasks: [],
  });

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Message operations
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Context drawer operations
  const toggleContextDrawer = useCallback(() => {
    setContextDrawer((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Notification operations
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, newNotification]);

      // Auto-dismiss if duration specified
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, notification.duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: ChatContextType = {
    // Messages
    messages,
    setMessages,
    addMessage,
    updateMessage,
    clearMessages,

    // Session
    currentSession,
    setCurrentSession,
    sessions,
    setSessions,

    // Loading states
    isLoading,
    setIsLoading,
    isStreaming,
    setIsStreaming,

    // Agent intelligence
    agentIntelligence,
    setAgentIntelligence,

    // Context drawer
    contextDrawer,
    setContextDrawer,
    toggleContextDrawer,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,

    // Error handling
    error,
    setError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
