import { Box, Container, Typography, Button, Stack, Card, CardContent } from '@mui/material'
import Link from 'next/link'
import { Psychology, Storage, Speed, Security } from '@mui/icons-material'

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Vibodh
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button component={Link} href="/login" variant="text">
                Sign In
              </Button>
              <Button component={Link} href="/signup" variant="contained">
                Get Started
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 6, md: 12 } }}>
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 'md',
            mx: 'auto',
            mb: 8,
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
            }}
          >
            AI Brain for Your Company
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{
              mb: 4,
              fontWeight: 400,
              fontSize: { xs: '1.125rem', md: '1.25rem' },
            }}
          >
            Connect your tools, centralize your knowledge, and unlock AI-powered insights
            in real time.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              size="large"
              sx={{ minWidth: 180 }}
            >
              Get Started Free
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              size="large"
              sx={{ minWidth: 180 }}
            >
              Sign In
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            No credit card required
          </Typography>
        </Box>

        {/* Features Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 8,
          }}
        >
          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Psychology sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                AI-Powered
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get instant answers from your company knowledge
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Storage sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Centralized
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sync from Slack, Notion, Drive, and more
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Speed sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Real-Time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Continuous learning from new content
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Security sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Secure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enterprise-grade security and privacy
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Vibodh. Building the AI Brain for Your Company.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
