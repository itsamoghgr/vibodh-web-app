import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
} from '@mui/material'
import { ArrowBack, Chat } from '@mui/icons-material'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface ChatSession {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

export default async function ChatHistoryPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) {
    redirect('/dashboard')
  }

  // Fetch chat sessions from backend
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  let sessions: ChatSession[] = []

  try {
    const response = await fetch(`${backendUrl}/api/chat/history?user_id=${user.id}&limit=20`, {
      cache: 'no-store',
    })
    if (response.ok) {
      const data = await response.json()
      sessions = data.sessions
    }
  } catch (error) {
    console.error('Failed to fetch chat history:', error)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={Link}
            href="/dashboard/chat"
            startIcon={<ArrowBack />}
            variant="outlined"
            size="small"
          >
            Back to Chat
          </Button>
          <div>
            <Typography variant="h4" component="h1">
              Chat History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and continue your previous conversations
            </Typography>
          </div>
        </Box>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <Chat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No chat history yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start a new conversation to see it here
              </Typography>
              <Button component={Link} href="/dashboard/chat" variant="contained">
                Start Chatting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {sessions.map((session) => (
              <Card key={session.id} variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main' } }}>
                <CardActionArea component={Link} href={`/dashboard/chat?session=${session.id}`}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {session.title || 'Untitled conversation'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(session.updated_at)}
                        </Typography>
                      </Box>
                      <Chip label="View" size="small" color="primary" variant="outlined" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </DashboardLayout>
  )
}
