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
      const response = await fetch(`${backendUrl}/api/chat/${sid}`)
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
      const response = await fetch(`${backendUrl}/api/chat/stream`, {
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
      await fetch(`${backendUrl}/api/chat/feedback?user_id=${userId}`, {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Messages Area */}
      <Paper
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          bgcolor: 'grey.50',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SmartToy sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask me anything about your company's knowledge base
            </Typography>
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
            }}
          >
            <Avatar sx={{ bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main' }}>
              {message.role === 'user' ? <Person /> : <SmartToy />}
            </Avatar>

            <Box sx={{ flex: 1, maxWidth: '80%' }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Paper>

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
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {message.context.map((ctx: any, idx: number) => (
                            <Card key={idx} variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                  Source {idx + 1} • Similarity: {(ctx.similarity * 100).toFixed(0)}%
                                </Typography>
                                <Typography variant="body2">{ctx.content}</Typography>
                              </CardContent>
                            </Card>
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
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <SmartToy />
            </Avatar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Thinking...
              </Typography>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Area */}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            variant="outlined"
            autoFocus
            multiline
            maxRows={4}
          />
          <IconButton type="submit" color="primary" disabled={isLoading || !input.trim()}>
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}
