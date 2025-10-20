/**
 * Comprehensive type definitions for Vibodh AI Chat System
 * Supports multiple message types, agent intelligence, and real-time interactions
 */

// ============================================================================
// Base Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'action_plan' | 'insight' | 'task' | 'system_event' | 'reflection';
export type ActionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AgentType = 'communication_agent' | 'marketing_agent' | 'ops_agent' | 'data_agent' | 'insight_agent';

// ============================================================================
// Agent Intelligence & Context
// ============================================================================

export type AgentCapability =
  | 'RAG'           // Retrieval-Augmented Generation
  | 'KG'            // Knowledge Graph
  | 'Memory'        // Conversation Memory
  | 'Insight'       // Data Insights
  | 'Marketing';    // Marketing Campaign

export interface AgentIntelligence {
  capabilities: AgentCapability[];
  confidenceScore: number;      // 0-1
  responseTimeMs: number;
  modulesUsed: string[];        // e.g., ['vector_search', 'knowledge_graph', 'llm']
  sourcesCount?: number;        // Number of sources/documents used
}

export interface ContextItem {
  id: string;
  type: 'document' | 'conversation' | 'knowledge_graph' | 'insight';
  title: string;
  snippet?: string;
  score?: number;               // Relevance score
  metadata?: Record<string, any>;
}

// ============================================================================
// Message Types
// ============================================================================

export interface BaseMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  createdAt: string;
  agentIntelligence?: AgentIntelligence;
  context?: ContextItem[];
}

// Text Message (standard chat message)
export interface TextMessage extends BaseMessage {
  type: 'text';
}

// Action Plan Message (multi-step plan requiring approval)
export interface ActionPlanMessage extends BaseMessage {
  type: 'action_plan';
  actionPlan: ActionPlan;
}

// Insight Message (data analysis, metrics, visualizations)
export interface InsightMessage extends BaseMessage {
  type: 'insight';
  insight: Insight;
}

// Task Message (progress tracking for long-running operations)
export interface TaskMessage extends BaseMessage {
  type: 'task';
  task: Task;
}

// System Event Message (notifications, status updates)
export interface SystemEventMessage extends BaseMessage {
  type: 'system_event';
  event: SystemEvent;
}

// Reflection Message (agent self-reflection, learnings)
export interface ReflectionMessage extends BaseMessage {
  type: 'reflection';
  reflection: Reflection;
}

export type ChatMessage =
  | TextMessage
  | ActionPlanMessage
  | InsightMessage
  | TaskMessage
  | SystemEventMessage
  | ReflectionMessage;

// ============================================================================
// Action Plan Types
// ============================================================================

export interface ActionStep {
  stepIndex: number;
  actionType: string;
  actionName: string;
  description: string;
  targetIntegration: string;      // e.g., 'slack', 'hubspot'
  targetResource?: Record<string, any>;
  parameters: Record<string, any>;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  dependsOn: number[];            // Indices of steps this depends on
  estimatedDurationMs: number;
  status?: ActionStatus;          // Runtime status
  result?: any;                   // Execution result
  error?: string;                 // Error message if failed
}

export interface ActionPlan {
  id: string;
  agentType: AgentType;
  goal: string;
  description: string;
  steps: ActionStep[];
  totalSteps: number;
  completedSteps: number;
  status: ActionStatus;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  context?: Record<string, any>;
  confidenceScore: number;
  estimatedTotalDurationMs: number;
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  executedSteps?: ExecutedStep[];
}

export interface ExecutedStep {
  stepIndex: number;
  actionName: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTimeMs?: number;
  timestamp: string;
}

// ============================================================================
// Insight Types
// ============================================================================

export type InsightType = 'metric' | 'trend' | 'anomaly' | 'prediction' | 'summary';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  data?: any;                     // Chart data, metrics, etc.
  visualization?: 'chart' | 'table' | 'card';
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedActions?: string[];
  timestamp: string;
}

// ============================================================================
// Task Types
// ============================================================================

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  progress: number;               // 0-100
  startedAt?: string;
  completedAt?: string;
  estimatedCompletionAt?: string;
  substeps?: TaskSubstep[];
  error?: string;
}

export interface TaskSubstep {
  name: string;
  status: TaskStatus;
  completedAt?: string;
}

// ============================================================================
// System Event Types
// ============================================================================

export type EventType =
  | 'action_executed'
  | 'action_failed'
  | 'integration_connected'
  | 'integration_disconnected'
  | 'agent_started'
  | 'agent_completed'
  | 'notification';

export interface SystemEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
  timestamp: string;
  actionable?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================================================
// Reflection Types
// ============================================================================

export interface Reflection {
  id: string;
  observation: string;
  learning: string;
  confidenceScore: number;
  shouldAdjustStrategy: boolean;
  suggestedImprovements: string[];
  timestamp: string;
}

// ============================================================================
// Session Types
// ============================================================================

export type SessionStatus = 'active' | 'archived';
export type SessionCategory = 'all' | 'marketing' | 'ops' | 'insights' | 'general';

export interface ChatSession {
  id: string;
  userId: string;
  orgId: string;
  title: string;
  status: SessionStatus;
  category?: SessionCategory;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  agentTypes?: AgentType[];       // Agents involved in this session
  tags?: string[];
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  duration?: number;              // Auto-dismiss after ms (0 = manual dismiss)
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
  metadata?: Record<string, any>;
}

// ============================================================================
// Streaming Types
// ============================================================================

export type StreamEventType =
  | 'session'           // Session created/updated
  | 'context'           // Context items retrieved
  | 'token'             // Text token
  | 'action_plan'       // Action plan created
  | 'insight'           // Insight generated
  | 'task_update'       // Task progress update
  | 'system_event'      // System event
  | 'reflection'        // Agent reflection
  | 'done'              // Stream complete
  | 'error';            // Error occurred

export interface StreamEvent {
  type: StreamEventType;
  sessionId?: string;
  content?: string;
  context?: ContextItem[];
  actionPlan?: ActionPlan;
  insight?: Insight;
  task?: Task;
  systemEvent?: SystemEvent;
  reflection?: Reflection;
  error?: string;
  messageType?: MessageType;
}

// ============================================================================
// Chat Context & State Types
// ============================================================================

export interface ChatState {
  messages: ChatMessage[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  agentIntelligence: AgentIntelligence | null;
}

export interface ChatContextDrawer {
  isOpen: boolean;
  activeModules: string[];
  recentSources: ContextItem[];
  recentPlans: ActionPlan[];
  activeTasks: Task[];
}

// ============================================================================
// UI Component Props Types
// ============================================================================

export interface ChatMessageCardProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, rating: 'positive' | 'negative') => void;
  onRetry?: (messageId: string) => void;
}

export interface ActionCardProps {
  actionPlan: ActionPlan;
  onApprove: (planId: string) => Promise<void>;
  onReject: (planId: string, reason?: string) => Promise<void>;
  onRun: (planId: string) => Promise<void>;
  onViewDetails: (planId: string) => void;
}

export interface AgentTagProps {
  capabilities: AgentCapability[];
  agentType?: AgentType;
  size?: 'small' | 'medium' | 'large';
}

export interface ContextIndicatorProps {
  agentIntelligence: AgentIntelligence;
  contextItems?: ContextItem[];
  onClick?: () => void;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ChatStreamResponse {
  events: StreamEvent[];
  sessionId?: string;
}

export interface ActionApprovalRequest {
  planId: string;
  userId: string;
  approved: boolean;
  reason?: string;
}

export interface ActionApprovalResponse {
  success: boolean;
  planId: string;
  status: ActionStatus;
  message?: string;
}

export interface SessionListResponse {
  sessions: ChatSession[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseChatReturn {
  messages: ChatMessage[];
  sessionId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  clearMessages: () => void;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export interface UseSessionsReturn {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  loadSessions: (filter?: SessionCategory) => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  createSession: (title?: string, category?: SessionCategory) => Promise<ChatSession>;
  deleteSession: (sessionId: string) => Promise<void>;
  archiveSession: (sessionId: string) => Promise<void>;
}
