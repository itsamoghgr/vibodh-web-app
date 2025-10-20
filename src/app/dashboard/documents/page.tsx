import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Alert,
  Button,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import DocumentsTable from '@/components/DocumentsTable'
import RetryFailedButton from '@/components/RetryFailedButton'

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

  // Get ALL documents for this org (no limit)
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('org_id', profile?.org_id)
    .order('created_at', { ascending: false })

  // Get document stats
  const { data: stats } = await supabase
    .rpc('get_document_stats', { org_uuid: profile?.org_id })

  // Count failed documents
  const { count: failedCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile?.org_id)
    .eq('embedding_status', 'failed')

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Documents
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                View and manage ingested data from your connected integrations
              </Typography>
            </Box>
            {failedCount !== null && failedCount > 0 && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Alert severity="warning">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {failedCount} failed embedding{failedCount > 1 ? 's' : ''}
                  </Typography>
                </Alert>
                <RetryFailedButton orgId={profile?.org_id || ''} failedCount={failedCount} />
              </Box>
            )}
          </Box>
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
          <DocumentsTable documents={documents} />
        )}
      </Container>
    
  )
}
