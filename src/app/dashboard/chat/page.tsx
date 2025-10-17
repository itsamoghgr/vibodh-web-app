import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatInterface from './ChatInterface'
import { Container, Box, Typography, Button } from '@mui/material'
import { ArrowBack, History } from '@mui/icons-material'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

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
    <DashboardLayout>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default',
      }}>
        {/* Header */}
        <Box sx={{
          px: 3,
          py: 2.5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button
              component={Link}
              href="/dashboard"
              startIcon={<ArrowBack />}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Powered by Vibodh
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href="/dashboard/chat/history"
            variant="outlined"
            startIcon={<History />}
            size="small"
          >
            History
          </Button>
        </Box>

        {/* Chat Interface */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <ChatInterface userId={user.id} orgId={profile.org_id} sessionId={sessionId} />
        </Box>
      </Box>
    </DashboardLayout>
  )
}
