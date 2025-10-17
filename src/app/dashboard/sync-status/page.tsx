import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { ArrowBack, CheckCircle, Error, Schedule } from '@mui/icons-material'
import Link from 'next/link'
import RefreshButton from './RefreshButton'
import DashboardLayout from '@/components/DashboardLayout'

export default async function SyncStatusPage() {
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

  // Get ingestion jobs
  const { data: jobs } = await supabase
    .from('ingestion_jobs')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('started_at', { ascending: false })
    .limit(10)

  // Get channel stats from documents
  const { data: documents } = await supabase
    .from('documents')
    .select('channel_name, channel_id, source_type, created_at')
    .eq('org_id', profile.org_id)
    .eq('source_type', 'slack')

  // Group by channel
  const channelStats = documents?.reduce((acc: any, doc: any) => {
    const channelId = doc.channel_id || 'unknown'
    if (!acc[channelId]) {
      acc[channelId] = {
        channel_name: doc.channel_name || channelId,
        channel_id: channelId,
        count: 0,
        latest_sync: doc.created_at,
      }
    }
    acc[channelId].count++
    if (new Date(doc.created_at) > new Date(acc[channelId].latest_sync)) {
      acc[channelId].latest_sync = doc.created_at
    }
    return acc
  }, {})

  const channels = Object.values(channelStats || {})

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />
      case 'failed':
        return <Error color="error" />
      case 'running':
        return <Schedule color="primary" />
      default:
        return <Schedule />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      case 'running':
        return 'primary'
      default:
        return 'default'
    }
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href="/dashboard/integrations"
            startIcon={<ArrowBack />}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
          >
            Back to Integrations
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography variant="h4" component="h1" gutterBottom>
                Sync Status
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View sync history and channel statistics
              </Typography>
            </div>
            <RefreshButton />
          </Box>
        </Box>

        {/* Channel Statistics */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Synced Channels ({channels.length})
            </Typography>
            {channels.length === 0 ? (
              <Typography color="text.secondary">No channels synced yet</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Channel</TableCell>
                      <TableCell align="right">Messages</TableCell>
                      <TableCell align="right">Latest Sync</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {channels.map((channel: any) => (
                      <TableRow key={channel.channel_id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">#</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {channel.channel_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={channel.count} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {new Date(channel.latest_sync).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Sync Jobs History */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Sync Jobs
            </Typography>
            {!jobs || jobs.length === 0 ? (
              <Typography color="text.secondary">No sync jobs yet</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell align="right">Fetched</TableCell>
                      <TableCell align="right">Created</TableCell>
                      <TableCell align="right">Embeddings</TableCell>
                      <TableCell align="right">Started</TableCell>
                      <TableCell align="right">Duration</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map((job: any) => {
                      const duration = job.completed_at
                        ? Math.round(
                            (new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000
                          )
                        : null

                      return (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(job.status)}
                              label={job.status}
                              size="small"
                              color={getStatusColor(job.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={job.source_type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{job.documents_fetched}</TableCell>
                          <TableCell align="right">{job.documents_created}</TableCell>
                          <TableCell align="right">{job.embeddings_generated}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {new Date(job.started_at).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {duration !== null ? (
                              <Typography variant="body2" color="text.secondary">
                                {duration}s
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {jobs && jobs.some((job: any) => job.error_message) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="error">
                  Recent errors:
                </Typography>
                {jobs
                  .filter((job: any) => job.error_message)
                  .map((job: any) => (
                    <Typography key={job.id} variant="caption" color="error" display="block">
                      {job.error_message}
                    </Typography>
                  ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </DashboardLayout>
  )
}
