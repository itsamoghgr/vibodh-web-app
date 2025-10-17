import { Box, Container, Typography, Button, Stack } from '@mui/material'
import Link from 'next/link'
import { Psychology, Storage, Speed, Security } from '@mui/icons-material'

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 8 }}>
        <Box
          sx={{
            textAlign: 'center',
            pt: 8,
            pb: 6,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Vibodh
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 4, maxWidth: 'md', mx: 'auto' }}
          >
            AI Brain for Your Company
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 4, maxWidth: 'sm', mx: 'auto' }}
          >
            Connect your tools, centralize your knowledge, and unlock AI-powered insights
            in real time. Vibodh learns from Slack, Notion, Drive, and more.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 8 }}
          >
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              size="large"
              sx={{ px: 4 }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              Sign In
            </Button>
          </Stack>

          {/* Features Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4,
              mt: 8,
            }}
          >
            <Box sx={{ textAlign: 'left', p: 3 }}>
              <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                AI-Powered Insights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask questions and get instant answers from your company's collective knowledge
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'left', p: 3 }}>
              <Storage sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Centralized Knowledge
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automatically sync data from Slack, Notion, Google Drive, Jira, and HubSpot
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'left', p: 3 }}>
              <Speed sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Real-Time Updates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Continuous learning from new messages and documents as they're created
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'left', p: 3 }}>
              <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Multi-Tenant Security
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organization-level isolation ensures your data stays private and secure
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Vibodh - Phase 1: Building the AI Brain for Your Company
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
