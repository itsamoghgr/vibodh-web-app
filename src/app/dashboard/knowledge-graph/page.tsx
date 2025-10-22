import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
} from '@mui/material'
import {
  ArrowBack,
  AccountTree,
  Group,
  Work,
  Topic,
  Build,
  BugReport,
} from '@mui/icons-material'
import Link from 'next/link'
import KnowledgeGraphLoader from '@/components/KnowledgeGraphLoader'

export default async function KnowledgeGraphPage() {
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

  const orgId = profile?.org_id

  // Get KG stats
  const statsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kg/stats/${orgId}`,
    { cache: 'no-store' }
  )
  const stats = statsResponse.ok ? await statsResponse.json() : null

  // Get entities and edges (default limit from API)
  const [entitiesResponse, edgesResponse] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kg/entities/${orgId}`,
      { cache: 'no-store' }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kg/edges/${orgId}`,
      { cache: 'no-store' }
    ),
  ])

  const entitiesData = entitiesResponse.ok ? await entitiesResponse.json() : { entities: [] }
  const edgesData = edgesResponse.ok ? await edgesResponse.json() : { edges: [] }

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Knowledge Graph
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Understand relationships between people, projects, and topics in your organization
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountTree sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h4">{stats.total_entities || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Entities
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Group sx={{ fontSize: 40, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h4">{stats.people_count || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      People
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Work sx={{ fontSize: 40, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h4">{stats.projects_count || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Projects
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Topic sx={{ fontSize: 40, color: 'info.main' }} />
                  <Box>
                    <Typography variant="h4">{stats.total_edges || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Relationships
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Interactive Knowledge Graph Visualization */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Interactive Knowledge Graph
          </Typography>
          <KnowledgeGraphLoader
            initialEntities={entitiesData.entities || []}
            initialEdges={edgesData.edges || []}
            orgId={orgId || ''}
            totalEntities={stats?.total_entities || 0}
            totalEdges={stats?.total_edges || 0}
            apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
          />
        </Box>
      </Container>
    
  )
}
