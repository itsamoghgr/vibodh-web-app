import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from '@mui/material'
import { ArrowBack, Psychology, Speed } from '@mui/icons-material'
import Link from 'next/link'

export default async function AIBrainPage() {
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

  // Get recent reasoning logs
  const { data: logs } = await supabase
    .from('reasoning_logs')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(20)

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'question':
        return 'primary'
      case 'task':
        return 'secondary'
      case 'summary':
        return 'info'
      case 'insight':
        return 'success'
      case 'risk':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href="/dashboard"
            startIcon={<ArrowBack />}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
          >
            Back to Dashboard
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Psychology sx={{ fontSize: 40, color: 'primary.main' }} />
            <div>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 0 }}>
                AI Brain Logs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track how Vibodh AI reasons through your queries
              </Typography>
            </div>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Queries
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {logs?.length || 0}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {logs && logs.length > 0
                  ? Math.round(
                      logs.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / logs.length
                    )
                  : 0}
                ms
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Most Common Intent
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                {logs && logs.length > 0
                  ? logs
                      .reduce((acc, log) => {
                        acc[log.intent] = (acc[log.intent] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                      ? Object.entries(
                          logs.reduce((acc, log) => {
                            acc[log.intent] = (acc[log.intent] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).sort((a, b) => b[1] - a[1])[0][0]
                      : 'N/A'
                  : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Reasoning Logs Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Recent Reasoning Steps
            </Typography>

            {!logs || logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Psychology sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No reasoning logs yet. Try asking a question in the chat!
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Query</TableCell>
                      <TableCell>Intent</TableCell>
                      <TableCell>Modules Used</TableCell>
                      <TableCell align="right">
                        <Speed sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Time
                      </TableCell>
                      <TableCell align="right">Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {log.query}
                          </Typography>
                          {log.response_summary && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {log.response_summary}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.intent}
                            size="small"
                            color={getIntentColor(log.intent) as any}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {log.modules_used?.map((module: string) => (
                              <Chip
                                key={module}
                                label={module.toUpperCase()}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {log.execution_time_ms}ms
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {new Date(log.created_at).toLocaleString()}
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
      </Container>
    
  )
}
