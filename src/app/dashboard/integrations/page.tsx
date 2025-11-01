import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper,
  Stack,
} from '@mui/material'
import {
  Chat as SlackIcon,
  Description as NotionIcon,
  Cloud as DriveIcon,
  BugReport as JiraIcon,
  AssignmentTurnedIn as ClickUpIcon,
  Campaign as GoogleAdsIcon,
  Facebook as MetaAdsIcon,
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
    id: 'clickup',
    name: 'ClickUp',
    description: 'Import tasks, comments, and project data from ClickUp',
    icon: ClickUpIcon,
    color: '#7B68EE',
    available: true,
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Connect Google Ads to track campaigns, metrics, and performance insights',
    icon: GoogleAdsIcon,
    color: '#4285F4',
    available: true,
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    description: 'Connect Meta Ads (Facebook/Instagram) to analyze campaign performance',
    icon: MetaAdsIcon,
    color: '#0668E1',
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

  // Get ads accounts
  const { data: adAccounts } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('org_id', profile.org_id)

  const connectedSources = new Set(connections?.map((c) => c.source_type) || [])

  // Add ads platforms to connected sources
  if (adAccounts && adAccounts.length > 0) {
    adAccounts.forEach((account) => {
      connectedSources.add(account.platform)
    })
  }

  return (
    
      <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                  component={Link}
                  href="/dashboard"
                  startIcon={<ArrowBack />}
                  variant="outlined"
                  size="small"
                >
                  Back to Dashboard
                </Button>
                <Button
                  component={Link}
                  href="/dashboard/sync-status"
                  variant="outlined"
                  startIcon={<History />}
                  size="small"
                >
                  View Sync Status
                </Button>
              </Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Integrations
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Connect your tools to enable AI-powered insights across your company's knowledge base
              </Typography>
            </Box>

            {/* Integration Cards */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
              }}
            >
              {integrations.map((integration) => {
                const Icon = integration.icon
                const isConnected = connectedSources.has(integration.id)
                const connection = connections?.find((c) => c.source_type === integration.id)

                // For ads integrations, find ad accounts
                const adAccount = (integration.id === 'google_ads' || integration.id === 'meta_ads')
                  ? adAccounts?.find((a) => a.platform === integration.id)
                  : null

                return (
                  <Box key={integration.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        opacity: integration.available ? 1 : 0.6,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                        },
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
                            zIndex: 1,
                          }}
                        />
                      )}

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2,
                              backgroundColor: `${integration.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                            }}
                          >
                            <Icon
                              sx={{
                                fontSize: 32,
                                color: integration.color,
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                              {integration.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {integration.available ? 'Available' : 'Coming Soon'}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                          {integration.description}
                        </Typography>

                        {isConnected && (connection || adAccount) && (
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 2,
                              bgcolor: 'grey.50',
                              borderRadius: 2,
                              border: '1px solid rgba(0, 0, 0, 0.06)',
                            }}
                          >
                            <Stack spacing={1}>
                              {/* Live Sync Status Badge */}
                              {connection?.metadata?.webhook_active && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: '#10b981',
                                      animation: 'pulse 2s infinite',
                                      '@keyframes pulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.5 },
                                      }
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981' }}>
                                    Live Sync Active
                                  </Typography>
                                </Box>
                              )}

                              {/* For ads accounts */}
                              {adAccount && (
                                <>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Account: <strong>{adAccount.account_name || adAccount.external_account_id}</strong>
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Connected: {new Date(adAccount.connected_at).toLocaleDateString()}
                                  </Typography>
                                  {adAccount.last_sync_at && (
                                    <Typography variant="caption" color="text.secondary">
                                      Last sync: {new Date(adAccount.last_sync_at).toLocaleString()}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981' }}>
                                    Auto-sync: Hourly
                                  </Typography>
                                </>
                              )}

                              {/* For other integrations */}
                              {connection && !adAccount && (
                                <>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Workspace: <strong>{connection.workspace_name}</strong>
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Connected: {new Date(connection.connected_at).toLocaleDateString()}
                                  </Typography>

                                  {/* Last Event Received */}
                                  {connection.metadata?.last_webhook_event ? (
                                    <Typography variant="caption" color="text.secondary">
                                      Last event: {new Date(connection.metadata.last_webhook_event).toLocaleString()}
                                    </Typography>
                                  ) : connection.last_sync_at ? (
                                    <Typography variant="caption" color="text.secondary">
                                      Last sync: {new Date(connection.last_sync_at).toLocaleString()}
                                    </Typography>
                                  ) : null}
                                </>
                              )}
                            </Stack>
                          </Paper>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 3, pt: 0 }}>
                        {integration.available ? (
                          <ConnectButton
                            integration={integration}
                            isConnected={isConnected}
                            connectionId={connection?.id || adAccount?.id}
                            orgId={profile.org_id}
                          />
                        ) : (
                          <Button variant="outlined" disabled fullWidth sx={{ py: 1.5 }}>
                            Coming Soon
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Box>
                )
              })}
            </Box>
      </Container>
    
  )
}
