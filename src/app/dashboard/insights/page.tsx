import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Container,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import InsightStatsCards from '@/components/InsightStatsCards'
import InsightCards from '@/components/InsightCards'
import TrendsChart from '@/components/TrendsChart'
import InsightActions from '@/components/InsightActions'

export default async function InsightsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's org_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.org_id

  if (!orgId) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error">
            Organization not found. Please contact support.
          </Typography>
        </Container>
      </DashboardLayout>
    )
  }

  // Fetch insight stats
  const statsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/insights/stats/${orgId}`,
    { cache: 'no-store' }
  )
  const stats = statsResponse.ok
    ? await statsResponse.json()
    : {
        total_insights: 0,
        project_insights: 0,
        team_insights: 0,
        trend_insights: 0,
        risk_insights: 0,
        general_insights: 0,
        avg_confidence: 0,
        last_generated: null,
      }

  // Fetch recent insights
  const insightsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/insights/list/${orgId}?limit=20`,
    { cache: 'no-store' }
  )
  const insightsData = insightsResponse.ok
    ? await insightsResponse.json()
    : { insights: [], count: 0 }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              AI Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-generated insights about organizational patterns, trends, and recommendations
            </Typography>
            {stats.last_generated && (
              <Chip
                label={`Last updated: ${new Date(stats.last_generated).toLocaleString()}`}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <InsightActions orgId={orgId} />
        </Box>

        {/* Stats Cards */}
        <Box sx={{ mb: 4 }}>
          <InsightStatsCards stats={stats} />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Insights List */}
          <Box sx={{ flex: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Insights
            </Typography>
            <InsightCards insights={insightsData.insights} />
          </Box>

          {/* Trends Chart */}
          <Box sx={{ flex: 1 }}>
            <TrendsChart title="Weekly Activity" />
          </Box>
        </Box>
      </Container>
    </DashboardLayout>
  )
}
