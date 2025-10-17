import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material'
import {
  Chat as SlackIcon,
  Description as NotionIcon,
  Cloud as DriveIcon,
  BugReport as JiraIcon,
  CheckCircle,
  Add,
  ArrowBack,
  History,
} from '@mui/icons-material'
import ConnectButton from './ConnectButton'
import Link from 'next/link'

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  color: string
  available: boolean
}

const integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Sync messages and conversations from your Slack workspace',
    icon: SlackIcon,
    color: '#4A154B',
    available: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Import pages, databases, and documentation from Notion',
    icon: NotionIcon,
    color: '#000000',
    available: false, // Coming soon
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Access documents, sheets, and files from Google Drive',
    icon: DriveIcon,
    color: '#4285F4',
    available: false, // Coming soon
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Pull tickets, issues, and project data from Jira',
    icon: JiraIcon,
    color: '#0052CC',
    available: false, // Coming soon
  },
]

export default async function IntegrationsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to get org_id
  console.log('Fetching profile for user ID:', user.id)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('Profile query result:', { profile, profileError })

  if (profileError) {
    console.error('Profile error:', profileError)
  }

  console.log('Profile data:', profile)
  console.log('Org ID:', profile?.org_id)

  if (!profile?.org_id) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error" paragraph>
            Error: Organization ID not found.
          </Typography>
          <Typography variant="body2" paragraph>
            User ID: {user.id}
          </Typography>
          <Typography variant="body2" paragraph>
            Profile: {profile ? JSON.stringify(profile) : 'NULL'}
          </Typography>
          <Typography variant="body2" paragraph>
            Error: {profileError ? JSON.stringify(profileError) : 'No error'}
          </Typography>
        </Box>
      </Container>
    )
  }

  // Get existing connections
  const { data: connections } = await supabase
    .from('connections')
    .select('*')
    .eq('org_id', profile.org_id)

  const connectedSources = new Set(connections?.map((c) => c.source_type) || [])

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              component={Link}
              href="/dashboard"
              startIcon={<ArrowBack />}
            >
              Back to Dashboard
            </Button>
            <Button
              component={Link}
              href="/dashboard/sync-status"
              variant="outlined"
              startIcon={<History />}
            >
              View Sync Status
            </Button>
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Integrations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect your tools to enable AI-powered insights across your company's knowledge base
          </Typography>
        </Box>

        {/* Integration Cards */}
        <Grid container spacing={3}>
          {integrations.map((integration) => {
            const Icon = integration.icon
            const isConnected = connectedSources.has(integration.id)
            const connection = connections?.find((c) => c.source_type === integration.id)

            return (
              <Grid item xs={12} md={6} key={integration.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    opacity: integration.available ? 1 : 0.6,
                  }}
                >
                  {isConnected && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Connected"
                      color="success"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Icon
                        sx={{
                          fontSize: 48,
                          color: integration.color,
                          mr: 2,
                        }}
                      />
                      <Typography variant="h5" component="h2">
                        {integration.name}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {integration.description}
                    </Typography>

                    {isConnected && connection && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Workspace: <strong>{connection.workspace_name}</strong>
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Connected: {new Date(connection.connected_at).toLocaleDateString()}
                        </Typography>
                        {connection.last_sync_at && (
                          <>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Last sync: {new Date(connection.last_sync_at).toLocaleString()}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {integration.available ? (
                      <ConnectButton
                        integration={integration}
                        isConnected={isConnected}
                        connectionId={connection?.id}
                        orgId={profile.org_id}
                      />
                    ) : (
                      <Button variant="outlined" disabled fullWidth>
                        Coming Soon
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Container>
  )
}
