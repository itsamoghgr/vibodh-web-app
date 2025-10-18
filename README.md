# Vibodh AI - Frontend

Modern Next.js web application for Vibodh AI, providing a beautiful, responsive interface for AI-powered knowledge management and team collaboration insights.

## Features

- 💬 **AI Chat Interface**: Real-time conversations with context-aware AI assistant
- 🔌 **Integration Management**: Connect and manage Slack, ClickUp, and other tools
- 📊 **Sync Status Dashboard**: Monitor data synchronization and ingestion jobs
- 🧠 **Knowledge Graph Visualization**: Interactive graph of entities and relationships
- 🎨 **Material UI Design**: Beautiful, consistent UI components
- 🔐 **Secure Authentication**: Supabase Auth integration
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **HTTP Client**: Axios
- **Graph Visualization**: React Force Graph
- **Styling**: MUI Theme System

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase project (same as backend)
- Backend API running (see `vibodh-ai/README.md`)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibodh-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Frontend URL (for OAuth redirects)
   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
   ```

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Project Structure

```
vibodh-web-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── chat/           # Chat interface
│   │   │   ├── integrations/   # Integration management
│   │   │   │   ├── page.tsx
│   │   │   │   └── ConnectButton.tsx
│   │   │   ├── sync-status/    # Sync status page
│   │   │   │   ├── page.tsx
│   │   │   │   └── RefreshButton.tsx
│   │   │   └── knowledge-graph/ # Knowledge graph viz
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable components
│   │   ├── DashboardLayout.tsx # Dashboard shell
│   │   ├── Navbar.tsx          # Navigation bar
│   │   └── Sidebar.tsx         # Sidebar navigation
│   ├── lib/
│   │   └── supabase/           # Supabase client setup
│   │       ├── client.ts       # Client-side
│   │       └── server.ts       # Server-side
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Key Pages & Features

### Authentication
- **Login** (`/login`): User authentication with Supabase
- **Signup** (`/signup`): New user registration

### Dashboard
- **Home** (`/dashboard`): Overview with quick stats and recent activity
- **Chat** (`/dashboard/chat`): AI-powered chat interface
  - Context-aware responses
  - Chat history
  - Source attribution
  - Markdown support
- **Integrations** (`/dashboard/integrations`): Manage connected tools
  - Slack integration with OAuth
  - ClickUp integration with OAuth
  - Connection status indicators
  - Manual sync triggers
  - Live sync badges
- **Sync Status** (`/dashboard/sync-status`): Monitor data synchronization
  - Slack channel statistics
  - ClickUp space statistics
  - Recent sync jobs
  - Error tracking
- **Knowledge Graph** (`/dashboard/knowledge-graph`): Interactive entity visualization
  - Force-directed graph layout
  - Entity and relationship exploration
  - Filtering and search

## Integration Setup

### Connecting Slack

1. Navigate to **Dashboard → Integrations**
2. Click **Connect** on the Slack card
3. Authorize the Slack app in the popup window
4. Click **Sync Now** to perform initial data import
5. Real-time sync will activate automatically

### Connecting ClickUp

1. Navigate to **Dashboard → Integrations**
2. Click **Connect** on the ClickUp card
3. Authorize the ClickUp app in the popup window
4. Click **Sync Now** to import tasks and projects
5. Webhook-based real-time sync will be enabled after first sync

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend base URL | ✅ |

## Development

### Adding New Pages

Create a new page in the `src/app/dashboard` directory:

```tsx
// src/app/dashboard/my-page/page.tsx
import DashboardLayout from '@/components/DashboardLayout'

export default function MyPage() {
  return (
    <DashboardLayout>
      <h1>My New Page</h1>
    </DashboardLayout>
  )
}
```

### Calling Backend API

Use the Supabase client for authenticated requests:

```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Make API call
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`, {
  headers: {
    'Authorization': `Bearer ${user?.access_token}`
  }
})
```

### Styling with MUI

All components use Material-UI theme system:

```tsx
import { Box, Typography, Button } from '@mui/material'

export default function MyComponent() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Title
      </Typography>
      <Button variant="contained" color="primary">
        Click Me
      </Button>
    </Box>
  )
}
```

## Code Quality

### Type Checking
```bash
npm run type-check
# or
yarn type-check
```

### Linting
```bash
npm run lint
# or
yarn lint
```

### Formatting
```bash
npm run format
# or
yarn format
```

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Test production build locally**
   ```bash
   npm start
   ```

3. **Deploy** (recommended platforms)
   - Vercel (optimal for Next.js)
   - Netlify
   - AWS Amplify

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_FRONTEND_URL`

### Custom Domain

In Vercel dashboard:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update OAuth redirect URIs in Slack/ClickUp apps

## Troubleshooting

### Common Issues

**Issue**: `Error: Invalid Supabase URL`
- **Solution**: Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

**Issue**: API calls fail with CORS errors
- **Solution**: Ensure backend is running and `NEXT_PUBLIC_API_URL` is correct

**Issue**: OAuth redirects fail
- **Solution**:
  - Check `NEXT_PUBLIC_FRONTEND_URL` matches your actual URL
  - Update Slack/ClickUp app redirect URIs
  - Ensure backend redirect URIs match

**Issue**: "Cannot connect to Supabase"
- **Solution**: Check network, Supabase project status, and credentials

**Issue**: Integrations page doesn't show connected status
- **Solution**:
  - Verify user profile has `org_id`
  - Check connections table in Supabase
  - Refresh the page

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- **Server Components**: Used by default in App Router
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: API responses cached where appropriate

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Your License Here]

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: [Your Contact Info]

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Supabase Documentation](https://supabase.com/docs)
