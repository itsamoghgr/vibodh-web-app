# Vibodh AI - Web Application

**AI Brain for Your Company** - Modern web interface for intelligent knowledge management and AI-powered insights.

---

## Features

### 💬 **Chat Interface**
- **Streaming Responses**: Real-time AI responses with progressive rendering
- **Session Management**: Persistent conversation history across sessions
- **Context Display**: Shows relevant documents used for each response
- **Feedback System**: Thumbs up/down rating for response quality
- **Copy to Clipboard**: Easy copying of AI responses
- **Session History**: Browse and resume previous conversations
- **Auto-scroll**: Automatically scrolls to new messages
- **Loading States**: Skeleton loaders and typing indicators

### 🔗 **Integrations Dashboard**
- **Slack Integration**:
  - One-click OAuth connection
  - Workspace status display
  - Channel sync with progress tracking
  - Disconnect capability
  - Error handling with user-friendly messages

- **ClickUp Integration**:
  - One-click OAuth connection
  - Workspace and task sync status
  - Real-time sync progress
  - Disconnect capability
  - Task and comment ingestion

### 📊 **Knowledge Graph Visualization**
- **Statistics Dashboard**:
  - Total entities count
  - Total relationships count
  - Entity type distribution
  - Most connected entities

- **Entity Explorer**:
  - List of extracted entities (people, projects, topics, tools, issues)
  - Entity type badges with color coding
  - Pagination with load more

- **Relationships View**:
  - Network of connections between entities
  - Source → Relationship → Target display
  - Relationship type labels
  - Confidence scoring visualization

### 💡 **Insights Dashboard**
- **AI-Generated Insights**:
  - Automated organizational insights
  - Category-based filtering (project, team, trend, risk, general)
  - Confidence level indicators
  - One-click insight generation
  - Timestamp tracking

- **Statistics Overview**:
  - Total insights count
  - Average confidence score
  - Last generation timestamp
  - Insights by category breakdown

### 📄 **Documents Management**
- **Document Browser**:
  - List of all ingested documents
  - Source type filtering (Slack, ClickUp)
  - Author and channel information
  - Embedding status tracking

- **Retry Failed Embeddings**:
  - One-click retry for failed documents
  - Progress feedback
  - Success/failure reporting

### 🔄 **Sync Status Monitoring**
- **Real-time Progress**:
  - Live sync status updates
  - Documents processed counter
  - Time elapsed tracking
  - Success/error indicators

- **Job History**:
  - Past sync operations
  - Status (completed, failed, in_progress)
  - Detailed statistics
  - Error logs when applicable

### 🧠 **Memory Dashboard** (Phase 3, Step 2)
- **Consolidated Insights**:
  - View all organizational memory
  - Filter by memory type (conversation, insight, decision, update)
  - Importance-based sorting
  - Access tracking

- **Memory Management**:
  - Automatic consolidation status
  - Decay visualization
  - Memory search and retrieval
  - Expiration tracking

### 📊 **AI Performance** (Phase 3, Step 3)
- **Performance Metrics**:
  - Real-time accuracy, response time, feedback stats
  - Module success rates (RAG, KG, Memory, Insights)
  - Response time by intent type
  - Confidence and accuracy trends

- **Adaptive Configuration**:
  - View current module weights
  - LLM parameter display
  - Optimization history
  - Manual optimization trigger

### 🧬 **Knowledge Evolution** (Phase 3, Step 4)
- **Meta Rules Tab**:
  - Discovered reasoning patterns
  - Rule confidence and success rates
  - Application count tracking
  - Category filtering

- **Schema Evolution Tab**:
  - Proposed KG entity/relation types
  - Approval/rejection workflow
  - Evolution history
  - Impact analysis

- **Model Snapshots Tab**:
  - Configuration before/after comparisons
  - Parameter change visualization
  - Performance metric trends
  - Snapshot timeline

- **Trends & Patterns Tab**:
  - Entity type growth charts (Recharts)
  - LLM-powered trend analysis
  - Emerging topics detection
  - Visual analytics

### ✅ **Human-in-the-Loop Approvals** (Phase 4) - NEW!
- **Approval Dashboard** (`/dashboard/approvals`):
  - Real-time pending actions table
  - Risk-level badges (low, medium, high, critical)
  - Approve/Reject actions with reasoning
  - Action plan details visualization
  - Auto-approval timeout display
  - Approval statistics cards

- **Analytics & Tracking**:
  - Pending, approved, rejected, and expired counts
  - Approval rate percentage
  - Average approval time metrics
  - Historical approval trends

### 📊 **Observability Dashboard** (Phase 4) - NEW!
- **System Overview** (`/dashboard/observability`):
  - Real-time system health status
  - Total plans, success rate, active integrations
  - Pending approvals counter
  - Agent count and health indicators

- **Agent Performance Metrics**:
  - Per-agent execution counts
  - Success rates and failure analysis
  - Average execution times
  - Total actions performed

- **Integration Health Monitoring**:
  - Integration status (healthy, degraded, failed)
  - Response time tracking
  - Last health check timestamps
  - Overall integration health status

- **Real-time Event Stream**:
  - Recent agent-to-agent events
  - Event type visualization
  - Source and target agent tracking
  - Auto-refresh (30-second intervals)

### 🎨 **User Interface**

#### Design System
- **Modern UI**: Clean, professional interface with shadcn/ui components
- **Dark Mode Ready**: Built with Tailwind CSS for easy theming
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: ARIA labels and keyboard navigation
- **Toast Notifications**: User-friendly success/error messages

#### Components
- **Reusable Cards**: Consistent card layouts across dashboards
- **Loading States**: Skeleton loaders for better UX
- **Error Boundaries**: Graceful error handling
- **Empty States**: Helpful messages when no data exists
- **Progress Indicators**: Visual feedback for long operations

### 🔐 **Authentication & Security**
- **Organization ID Pattern**: org_id retrieved from localStorage for multi-tenancy
- **Backend URL Configuration**: NEXT_PUBLIC_API_URL environment variable
- **Query Parameter Pattern**: org_id passed as URL query parameter to backend APIs
- **Protected Routes**: Dashboard requires authentication
- **Session Management**: Persistent login state via localStorage
- **Logout Functionality**: Secure session termination
- **Multi-tenant Architecture**: Organization-based data isolation

### ⚡ **Performance**
- **Next.js 15**: Latest React framework with App Router
- **Server Components**: Faster initial page loads
- **Client Components**: Interactive features where needed
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **API Route Handlers**: Backend for frontend (BFF) pattern

### 🛠️ **Developer Experience**
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Hot Module Replacement**: Instant updates during development
- **Environment Variables**: `.env.local` for configuration
- **Component Structure**: Organized by feature
- **API Abstraction**: Centralized API calls

---

## Pages & Routes

### Public Routes
- `/` - Landing page
- `/login` - Authentication page

### Dashboard Routes (`/dashboard`)
- `/dashboard` - Main dashboard overview
- `/dashboard/chat` - Chat interface
- `/dashboard/chat/history` - Chat session history
- `/dashboard/integrations` - Integration management (Slack, ClickUp)
- `/dashboard/knowledge-graph` - Knowledge graph visualization
- `/dashboard/insights` - AI insights dashboard
- `/dashboard/documents` - Document browser
- `/dashboard/sync-status` - Sync monitoring
- `/dashboard/approvals` - Human-in-the-loop approval workflow (Phase 4)
- `/dashboard/observability` - System health and agent performance (Phase 4)

---

## Tech Stack

**Framework**: Next.js 15.1.3

**React**: React 19.0.0

**UI Components**:
- Material-UI (MUI) v6.3.1
- MUI Icons
- Flexbox layouts (migrated from Grid to Box)
- Responsive design with Box and sx props

**Authentication**: Supabase Auth (@supabase/ssr)

**Type Safety**: TypeScript

**Code Quality**: ESLint

**Fonts**: Geist (optimized with next/font)

---

## Project Structure

```
vibodh-web-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Authentication
│   │   ├── dashboard/          # Main application
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── chat/           # Chat interface
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   └── history/    # Chat history
│   │   │   ├── integrations/   # Integration management
│   │   │   │   └── ConnectButton.tsx
│   │   │   ├── knowledge-graph/ # KG visualization
│   │   │   ├── insights/       # Insights dashboard
│   │   │   ├── documents/      # Document browser
│   │   │   ├── sync-status/    # Sync monitoring
│   │   │   ├── approvals/      # Approval workflow (Phase 4)
│   │   │   ├── observability/  # System health dashboard (Phase 4)
│   │   │   └── LogoutButton.tsx
│   │   ├── api/                # API route handlers
│   │   │   └── insights/
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Shared components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── RetryFailedButton.tsx
│   └── lib/                    # Utilities
│       └── supabase/           # Supabase client
├── public/                     # Static assets
├── supabase/                   # Supabase config
├── .env.local                  # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Required in `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Key Features Implementation

### Chat Interface
- **File**: `src/app/dashboard/chat/ChatInterface.tsx`
- Streaming SSE (Server-Sent Events)
- Markdown rendering
- Session persistence
- Real-time typing indicators

### Integration Connections
- **File**: `src/app/dashboard/integrations/ConnectButton.tsx`
- OAuth flow handling
- Sync progress tracking
- Error boundary handling
- Status polling

### Knowledge Graph
- **File**: `src/app/dashboard/knowledge-graph/page.tsx`
- Entity and edge fetching
- Statistics aggregation
- Pagination support
- Type filtering

### Insights
- **File**: `src/app/dashboard/insights/page.tsx`
- Insight generation trigger
- Category filtering
- Confidence visualization
- Refresh mechanism

### Approvals (Phase 4)
- **File**: `src/app/dashboard/approvals/page.tsx`
- Pending actions table with risk badges
- Approve/Reject action handlers
- Approval statistics cards
- Real-time data fetching with org_id

### Observability (Phase 4)
- **File**: `src/app/dashboard/observability/page.tsx`
- System overview metrics
- Agent performance table
- Integration health monitoring
- Real-time event stream
- Auto-refresh every 30 seconds

---

## API Integration

All API calls use the versioned endpoint structure:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const orgId = localStorage.getItem('vibodh_org_id') || '72348f50-35a7-41da-9f48-c7bfaff6049d';

// Examples:
`${apiUrl}/api/v1/chat/stream`
`${apiUrl}/api/v1/kg/entities/{orgId}`
`${apiUrl}/api/v1/insights/list/{orgId}`
`${apiUrl}/api/v1/slack/connect`
`${apiUrl}/api/v1/clickup/sync/{connectionId}`

// Phase 4 endpoints (with org_id query param):
`${apiUrl}/api/v1/approvals/pending?org_id=${orgId}`
`${apiUrl}/api/v1/approvals/${actionId}/decide?org_id=${orgId}`
`${apiUrl}/api/v1/approvals/stats?org_id=${orgId}`
`${apiUrl}/api/v1/analytics/overview?org_id=${orgId}`
`${apiUrl}/api/v1/analytics/agents/performance?org_id=${orgId}`
`${apiUrl}/api/v1/analytics/integrations/health?org_id=${orgId}`
`${apiUrl}/api/v1/analytics/events/recent?org_id=${orgId}`
```

---

## License

Proprietary - All rights reserved
