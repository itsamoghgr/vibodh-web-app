import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatInterface from './ChatInterface'
import { Container, Box, Typography, Button } from '@mui/material'
import { ArrowBack, History } from '@mui/icons-material'
import Link from 'next/link'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>
}) {
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

  // Get session ID from URL query param
  const params = await searchParams
  const sessionId = params.session || undefined

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button component={Link} href="/dashboard" startIcon={<ArrowBack />}>
              Back
            </Button>
            <div>
              <Typography variant="h4" component="h1">
                Chat with Vibodh AI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask questions about your company's knowledge base
              </Typography>
            </div>
          </Box>
          <Button
            component={Link}
            href="/dashboard/chat/history"
            variant="outlined"
            startIcon={<History />}
          >
            History
          </Button>
        </Box>

        {/* Chat Interface */}
        <ChatInterface userId={user.id} orgId={profile.org_id} sessionId={sessionId} />
      </Box>
    </Container>
  )
}
