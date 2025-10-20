'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material'
import { ArrowBack, Chat, Delete } from '@mui/icons-material'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface ChatSession {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

export default function ChatHistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [orgId, setOrgId] = useState<string>('')

  useEffect(() => {
    loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSessions = async () => {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    setUserId(user.id)

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (!profile?.org_id) {
      router.push('/dashboard')
      return
    }

    setOrgId(profile.org_id)

    // Fetch chat sessions from backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/v1/chat/history?org_id=${profile.org_id}&user_id=${user.id}&limit=20`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSessionToDelete(sessionId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/api/v1/chat/${sessionToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setSessions(sessions.filter(s => s.id !== sessionToDelete))
      } else {
        console.error('Failed to delete session')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    } finally {
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSessionToDelete(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={Link}
            href="/dashboard/chat"
            startIcon={<ArrowBack />}
            variant="outlined"
            size="small"
          >
            Back to Chat
          </Button>
          <div>
            <Typography variant="h4" component="h1">
              Chat History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and continue your previous conversations
            </Typography>
          </div>
        </Box>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <Chat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No chat history yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start a new conversation to see it here
              </Typography>
              <Button component={Link} href="/dashboard/chat" variant="contained">
                Start Chatting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Stack spacing={2}>
              {sessions.map((session) => (
                <Card key={session.id} variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main' } }}>
                  <CardActionArea component={Link} href={`/dashboard/chat?session=${session.id}`}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {session.title || 'Untitled conversation'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(session.updated_at)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => handleDeleteClick(session.id, e)}
                            sx={{ '&:hover': { bgcolor: 'error.lighter' } }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                          <Chip label="View" size="small" color="primary" variant="outlined" />
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
              <DialogTitle>Delete Chat Session?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this conversation? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteCancel} color="inherit">
                  Cancel
                </Button>
                <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>
    </DashboardLayout>
  )
}
