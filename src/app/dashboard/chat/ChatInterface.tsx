'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Collapse,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material'
import {
  Send,
  Person,
  SmartToy,
  ExpandMore,
  ExpandLess,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: any[]
  created_at: string
}

interface ChatInterfaceProps {
  userId: string
  orgId: string
  sessionId?: string
}

export default function ChatInterface({ userId, orgId, sessionId: initialSessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [expandedContext, setExpandedContext] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load session messages if sessionId provided
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId)
    }
  }, [initialSessionId])

  const loadSession = async (sid: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/api/v1/chat/${sid}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setSessionId(sid)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          org_id: orgId,
          user_id: userId,
          session_id: sessionId,
          max_context_items: 5,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        context: [],
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'session' && data.session_id) {
              setSessionId(data.session_id)
            } else if (data.type === 'context') {
              assistantMessage.context = data.context
              setMessages((prev) => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = { ...assistantMessage }
                return newMessages
              })
            } else if (data.type === 'token') {
              assistantMessage.content += data.content
              setMessages((prev) => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = { ...assistantMessage }
                return newMessages
              })
            } else if (data.type === 'done') {
              setIsLoading(false)
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          created_at: new Date().toISOString(),
        },
      ])
      setIsLoading(false)
    }
  }

  const handleFeedback = async (messageId: string, rating: 'positive' | 'negative') => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      await fetch(`${backendUrl}/api/v1/chat/feedback?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          rating: rating,
        }),
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  const toggleContext = (messageId: string) => {
    setExpandedContext((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* Messages Area */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 0,
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          position: 'relative',
        }}
      >
        {messages.length === 0 && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            py: 8,
            px: 4,
          }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 3,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <SmartToy sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome to Vibodh AI
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, textAlign: 'center' }}>
              I'm your AI assistant. Ask me anything about your company's knowledge base, documents, or team insights.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 700 }}>
              {[
                "What's in our latest project updates?",
                "Summarize our team meetings",
                "Find information about our products",
                "What are our company policies?"
              ].map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => setInput(suggestion)}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              mb: 3,
              px: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: message.role === 'user' ? 'primary.main' : 'grey.200',
                width: 36,
                height: 36,
                fontSize: '1rem',
              }}
            >
              {message.role === 'user' ? <Person sx={{ fontSize: 20 }} /> : <SmartToy sx={{ fontSize: 20, color: 'text.primary' }} />}
            </Avatar>

            <Box sx={{ flex: 1, maxWidth: '80%' }}>
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  border: message.role === 'user' ? 'none' : '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {message.content}
                </Typography>

                {/* Context & Feedback for Assistant Messages */}
                {message.role === 'assistant' && (
                <Box sx={{ mt: 1 }}>
                  {/* Context Toggle */}
                  {message.context && message.context.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        icon={expandedContext[message.id] ? <ExpandLess /> : <ExpandMore />}
                        label={`${message.context.length} sources`}
                        size="small"
                        onClick={() => toggleContext(message.id)}
                        sx={{ cursor: 'pointer' }}
                      />

                      <Collapse in={expandedContext[message.id]}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {message.context.map((ctx: any, idx: number) => (
                            <Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Source {idx + 1} • {(ctx.similarity * 100).toFixed(0)}% match
                              </Typography>
                              <Typography variant="body2" color="text.primary">{ctx.content}</Typography>
                            </Paper>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  )}

                  {/* Feedback Buttons */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleFeedback(message.id, 'positive')}
                      sx={{ '&:hover': { color: 'success.main' } }}
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleFeedback(message.id, 'negative')}
                      sx={{ '&:hover': { color: 'error.main' } }}
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                )}
              </Box>
            </Box>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3, px: 2 }}>
            <Avatar sx={{ bgcolor: 'grey.200', width: 36, height: 36 }}>
              <SmartToy sx={{ fontSize: 20, color: 'text.primary' }} />
            </Avatar>
            <Box sx={{
              p: 2.5,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              maxWidth: '80%',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[0, 1, 2].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: 'text.secondary',
                        animation: `thinking-pulse 1.4s ease-in-out infinite`,
                        animationDelay: `${index * 0.2}s`,
                        '@keyframes thinking-pulse': {
                          '0%, 60%, 100%': {
                            transform: 'scale(0.8)',
                            opacity: 0.4,
                          },
                          '30%': {
                            transform: 'scale(1)',
                            opacity: 1,
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2.5,
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-end',
          maxWidth: 900,
          mx: 'auto',
        }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            placeholder="Message Vibodh AI..."
            disabled={isLoading}
            variant="outlined"
            autoFocus
            multiline
            maxRows={4}
            slotProps={{
              input: {
                sx: {
                  bgcolor: 'background.paper',
                  '& input': {
                    bgcolor: 'transparent',
                  },
                  '& textarea': {
                    bgcolor: 'transparent',
                  },
                }
              }
            }}
          />
          <IconButton
            type="submit"
            disabled={isLoading || !input.trim()}
            color="primary"
            sx={{
              width: 44,
              height: 44,
              '&:disabled': {
                color: 'action.disabled',
              },
            }}
          >
            {isLoading ? <CircularProgress size={20} /> : <Send />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

