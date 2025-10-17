import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Extension as IntegrationIcon,
  Description as DocumentIcon,
  Chat as ChatIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  org_id: string
}

interface Organization {
  id: string
  name: string
  created_at: string
}

export default async function DashboardPage() {
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
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile?.org_id)
    .single<Organization>()

  // Get team members count
  const { count: teamCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile?.org_id)

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h3" component="h1">
            Dashboard
          </Typography>
          <LogoutButton />
        </Box>

        {/* Welcome Message */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Welcome back, {profile?.full_name || user.email}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You're all set up with Vibodh. Your organization is ready to start ingesting data and
            gaining AI-powered insights.
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Organization</Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {organization?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created {new Date(organization?.created_at || '').toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Your Profile</Typography>
                </Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {profile?.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Role:</strong> {profile?.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Team members: {teamCount || 1}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ChatIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Chat with AI</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Ask questions about your company's knowledge base
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard/chat"
                  variant="contained"
                  fullWidth
                >
                  Start Chatting
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IntegrationIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Integrations</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Connect your tools (Slack, Notion, Drive) to enable AI-powered insights
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard/integrations"
                  variant="outlined"
                  fullWidth
                >
                  Manage Integrations
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DocumentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Documents</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View and manage ingested data from your connected integrations
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard/documents"
                  variant="outlined"
                  fullWidth
                >
                  View Documents
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}
