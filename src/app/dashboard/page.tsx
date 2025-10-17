import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Stack,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Extension as IntegrationIcon,
  Description as DocumentIcon,
  Chat as ChatIcon,
  TrendingUp as AnalyticsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardCard from '@/components/DashboardCard'

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
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome back, {profile?.full_name || user.email}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Your organization is ready to start ingesting data and gaining AI-powered insights.
              </Typography>
            </Box>

            {/* Stats Overview */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3,
                mb: 4,
              }}
            >
              <DashboardCard
                title="Organization"
                subtitle={organization?.name}
                value={teamCount || 1}
                icon={<BusinessIcon />}
                color="primary"
                variant="stat"
                chip={{
                  label: 'Active',
                  color: 'success',
                }}
              />
              <DashboardCard
                title="Your Role"
                subtitle={profile?.email}
                value={profile?.role}
                icon={<PersonIcon />}
                color="secondary"
                variant="stat"
              />
              <DashboardCard
                title="Created"
                subtitle="Organization setup"
                value={new Date(organization?.created_at || '').toLocaleDateString()}
                icon={<CheckIcon />}
                color="success"
                variant="stat"
              />
            </Box>

            {/* Quick Actions */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              <DashboardCard
                title="Chat with AI"
                subtitle="Ask questions about your company's knowledge base"
                icon={<ChatIcon />}
                color="primary"
                variant="action"
                href="/dashboard/chat"
              />
              
              <DashboardCard
                title="Integrations"
                subtitle="Connect your tools (Slack, Notion, Drive) to enable AI-powered insights"
                icon={<IntegrationIcon />}
                color="secondary"
                variant="action"
                href="/dashboard/integrations"
              />
              
              <DashboardCard
                title="Documents"
                subtitle="View and manage ingested data from your connected integrations"
                icon={<DocumentIcon />}
                color="success"
                variant="action"
                href="/dashboard/documents"
              />
            </Box>

            {/* Recent Activity */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Recent Activity
              </Typography>
              
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckIcon color="success" />
                    <Typography variant="body2" color="text.secondary">
                      Organization created successfully
                    </Typography>
                    <Chip label="Today" size="small" color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IntegrationIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Ready to connect your first integration
                    </Typography>
                    <Chip label="Next step" size="small" color="secondary" />
                  </Box>
                </Stack>
              </Paper>
            </Box>
      </Container>
    </DashboardLayout>
  )
}
