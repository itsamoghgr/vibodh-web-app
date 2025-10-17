import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material'
import {
  Chat as SlackIcon,
  Description as NotionIcon,
  Cloud as DriveIcon,
  BugReport as JiraIcon,
  CheckCircle,
  Schedule,
  Error,
  ArrowBack,
} from '@mui/icons-material'
import Link from 'next/link'
import { Button } from '@mui/material'

const sourceIcons: Record<string, any> = {
  slack: SlackIcon,
  notion: NotionIcon,
  drive: DriveIcon,
  jira: JiraIcon,
}

const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
}

const statusIcons: Record<string, any> = {
  completed: CheckCircle,
  pending: Schedule,
  failed: Error,
}

export default async function DocumentsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to get org_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  // Get documents for this org
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('org_id', profile?.org_id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get document stats
  const { data: stats } = await supabase
    .rpc('get_document_stats', { org_uuid: profile?.org_id })

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href="/dashboard"
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Documents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage ingested data from your connected integrations
          </Typography>
        </Box>

        {/* Stats Cards */}
        {stats && stats.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {stats.map((stat: any) => (
              <Paper key={stat.source_type} sx={{ p: 2, flex: '1 1 200px' }}>
                <Typography variant="caption" color="text.secondary">
                  {stat.source_type.toUpperCase()}
                </Typography>
                <Typography variant="h5">{stat.total_documents}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={`${stat.completed_embeddings} embedded`}
                    color="success"
                    sx={{ mr: 0.5 }}
                  />
                  {stat.pending_embeddings > 0 && (
                    <Chip
                      size="small"
                      label={`${stat.pending_embeddings} pending`}
                      color="warning"
                    />
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* Documents Table */}
        {!documents || documents.length === 0 ? (
          <Alert severity="info">
            No documents yet. Connect an integration and sync to see data here.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Source</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => {
                  const SourceIcon = sourceIcons[doc.source_type]
                  const StatusIcon = statusIcons[doc.embedding_status]
                  const statusColor = statusColors[doc.embedding_status]

                  return (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {SourceIcon && <SourceIcon fontSize="small" />}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {doc.source_type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {doc.title || doc.content?.substring(0, 50) + '...'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{doc.author || 'Unknown'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {doc.channel_name || doc.channel_id || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={StatusIcon && <StatusIcon />}
                          label={doc.embedding_status}
                          color={statusColor}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  )
}
