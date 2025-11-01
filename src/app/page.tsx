'use client'

import { Box, Container, Typography, Button, Stack, Card, CardContent, alpha } from '@mui/material'
import Link from 'next/link'
import {
  Psychology,
  AutoAwesome,
  AccountTree,
  Chat,
  Lightbulb,
  Speed,
  PlayArrow,
  TrendingUp,
  ArrowForward,
} from '@mui/icons-material'

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '120%',
          height: '120%',
          background: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15), transparent 50%)',
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30%',
          right: '-10%',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.15), transparent 50%)',
          animation: 'pulse-reverse 8s ease-in-out infinite',
          '@keyframes pulse-reverse': {
            '0%, 100%': { transform: 'scale(1.1)' },
            '50%': { transform: 'scale(1)' },
          },
        }}
      />

      {/* Header with Glassmorphism */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backdropFilter: 'blur(12px)',
          bgcolor: alpha('#0a0a0f', 0.8),
          borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                  }}
                >
                  V
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Vibodh
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                component={Link}
                href="/login"
                variant="text"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.05),
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
                  '&:hover': {
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.6)',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 16 } }}>
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: '900px',
              mx: 'auto',
              mb: 10,
            }}
          >
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                mb: 4,
                borderRadius: 50,
                bgcolor: alpha('#7C3AED', 0.1),
                border: `1px solid ${alpha('#7C3AED', 0.3)}`,
              }}
            >
              <AutoAwesome sx={{ fontSize: 18, color: '#7C3AED' }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Powered by Advanced AI
              </Typography>
            </Box>

            {/* Hero Headline */}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              The AI Brain That
              <br />
              Never Stops Learning
            </Typography>

            {/* Hero Subtitle */}
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 400,
                fontSize: { xs: '1.125rem', md: '1.375rem' },
                lineHeight: 1.6,
                maxWidth: '700px',
                mx: 'auto',
              }}
            >
              Vibodh continuously learns from your data, adapts to your needs, and delivers
              intelligent insights that evolve with your business
            </Typography>

            {/* CTAs */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 3 }}
            >
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  minWidth: 200,
                  py: 1.75,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)',
                  '&:hover': {
                    boxShadow: '0 0 40px rgba(124, 58, 237, 0.7)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Get Started Free
              </Button>
              <Button
                component={Link}
                href="#features"
                variant="outlined"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  minWidth: 200,
                  py: 1.75,
                  borderColor: alpha('#fff', 0.2),
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  backdropFilter: 'blur(10px)',
                  bgcolor: alpha('#fff', 0.03),
                  '&:hover': {
                    borderColor: alpha('#fff', 0.4),
                    bgcolor: alpha('#fff', 0.08),
                  },
                }}
              >
                See How It Works
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              No credit card required • Free forever plan available
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Key Features Section */}
      <Box id="features" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: '#7C3AED',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: 2,
              }}
            >
              PLATFORM CAPABILITIES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                color: '#fff',
                mt: 1,
                mb: 2,
              }}
            >
              Intelligence That Evolves With You
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Powered by cutting-edge AI, Vibodh transforms your data into actionable intelligence
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
            }}
          >
            {[
              {
                icon: AccountTree,
                title: 'Knowledge Graph',
                description: 'Visual knowledge connections that map relationships across your entire data ecosystem',
                color: '#7C3AED',
              },
              {
                icon: Psychology,
                title: 'CIL Intelligence',
                description: 'Continuous Iterative Learning that optimizes your campaigns and decisions in real-time',
                color: '#2563EB',
              },
              {
                icon: Speed,
                title: 'Memory System',
                description: 'Persistent context that remembers every interaction and builds deeper understanding',
                color: '#06B6D4',
              },
              {
                icon: Chat,
                title: 'AI Chat',
                description: 'Conversational intelligence that understands context and provides instant answers',
                color: '#8B5CF6',
              },
              {
                icon: Lightbulb,
                title: 'Smart Insights',
                description: 'AI-generated insights that surface patterns, trends, and opportunities automatically',
                color: '#F43F5E',
              },
              {
                icon: TrendingUp,
                title: 'Real-Time Analytics',
                description: 'Live performance metrics and AI-powered recommendations for continuous improvement',
                color: '#10B981',
              },
            ].map((feature) => (
              <Box
                key={feature.title}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: alpha('#fff', 0.02),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.05),
                      borderColor: alpha(feature.color, 0.5),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 32px ${alpha(feature.color, 0.2)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        background: alpha(feature.color, 0.1),
                        border: `1px solid ${alpha(feature.color, 0.3)}`,
                      }}
                    >
                      <feature.icon sx={{ fontSize: 32, color: feature.color }} />
                    </Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: '#fff',
                        mb: 1.5,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: 1.7,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Integrations Section */}
      <Box sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: 2,
              }}
            >
              INTEGRATIONS
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                color: '#fff',
                mt: 1,
                mb: 2,
              }}
            >
              Connect Your Entire Stack
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Seamlessly integrate with the tools you already use
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            {[
              'Slack',
              'Notion',
              'Google Drive',
              'Google Ads',
              'Meta Ads',
              'Salesforce',
              'HubSpot',
              'Stripe',
              'Shopify',
              'Zendesk',
              'Intercom',
              'More...',
            ].map((integration) => (
              <Box
                key={integration}
                sx={{
                  flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(25% - 12px)', lg: '1 1 calc(16.666% - 14px)' },
                  minWidth: { xs: 140, sm: 150 },
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  bgcolor: alpha('#fff', 0.02),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha('#fff', 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.05),
                    borderColor: alpha('#7C3AED', 0.5),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600,
                  }}
                >
                  {integration}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: '#06B6D4',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: 2,
              }}
            >
              USE CASES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                color: '#fff',
                mt: 1,
              }}
            >
              Built For Modern Teams
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            {[
              {
                title: 'Marketing Teams',
                description:
                  'AI-powered ads optimization, performance tracking, and automated campaign improvements with CIL Intelligence',
                benefits: [
                  'Optimize ad spend automatically',
                  'Track cross-platform performance',
                  'Get AI-generated insights',
                ],
              },
              {
                title: 'Knowledge Workers',
                description:
                  'Instant answers from company knowledge, smart search across all sources, and context-aware AI assistance',
                benefits: [
                  'Search across all platforms',
                  'Get instant, accurate answers',
                  'AI that remembers context',
                ],
              },
              {
                title: 'Data-Driven Teams',
                description:
                  'Real-time analytics, observability dashboards, and knowledge evolution tracking for continuous improvement',
                benefits: [
                  'Track knowledge evolution',
                  'Monitor AI performance',
                  'Make data-backed decisions',
                ],
              },
            ].map((useCase) => (
              <Box
                key={useCase.title}
                sx={{
                  flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 22px)' },
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: alpha('#fff', 0.03),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    borderRadius: 3,
                    p: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#fff',
                      mb: 2,
                    }}
                  >
                    {useCase.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 3,
                      lineHeight: 1.7,
                    }}
                  >
                    {useCase.description}
                  </Typography>
                  <Stack spacing={1.5}>
                    {useCase.benefits.map((benefit) => (
                      <Box key={benefit} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: '#7C3AED',
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {benefit}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 4, md: 8 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#fff',
                mb: 2,
              }}
            >
              Ready to Build Your AI Brain?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 4,
                fontWeight: 400,
              }}
            >
              Join forward-thinking teams using Vibodh to unlock the power of AI
            </Typography>
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                minWidth: 220,
                py: 2,
                background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.125rem',
                boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)',
                '&:hover': {
                  boxShadow: '0 0 40px rgba(124, 58, 237, 0.7)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 6,
          mt: 8,
          borderTop: `1px solid ${alpha('#fff', 0.1)}`,
          background: `linear-gradient(180deg, transparent 0%, ${alpha('#000', 0.3)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              mb: 4,
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(40% - 16px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
                    V
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                  Vibodh
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                The AI Brain That Never Stops Learning
              </Typography>
            </Box>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(15% - 16px)' } }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1}>
                {['Features', 'Integrations', 'Pricing', 'Docs'].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      '&:hover': { color: '#7C3AED' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(15% - 16px)' } }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      '&:hover': { color: '#7C3AED' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(15% - 16px)' } }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                Legal
              </Typography>
              <Stack spacing={1}>
                {['Privacy', 'Terms', 'Security'].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      '&:hover': { color: '#7C3AED' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(15% - 16px)' } }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                Social
              </Typography>
              <Stack spacing={1}>
                {['Twitter', 'LinkedIn', 'GitHub'].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      '&:hover': { color: '#7C3AED' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Box>
          <Box
            sx={{
              pt: 4,
              borderTop: `1px solid ${alpha('#fff', 0.1)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              © 2025 Vibodh. Building the AI Brain for Your Company.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Made with AI Intelligence
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
