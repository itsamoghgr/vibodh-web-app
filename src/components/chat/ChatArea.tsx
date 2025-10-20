'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  KeyboardArrowDown as ScrollDownIcon,
} from '@mui/icons-material';
import { useChat } from '@/hooks/useChat';
import ChatMessageCard from './ChatMessageCard';

interface ChatAreaProps {
  userId: string;
  orgId: string;
}

export default function ChatArea({ userId, orgId }: ChatAreaProps) {
  const { messages, isLoading, isStreaming, sendMessage } = useChat(userId, orgId);
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    setShowScrollButton(!isNearBottom && messages.length > 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const messageText = input.trim();
    setInput('');
    await sendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Messages Area */}
      <Box
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              py: 8,
              px: 4,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <BotIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome to Vibodh AI
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, textAlign: 'center' }}
            >
              Your intelligent assistant for knowledge, insights, and automation. Ask me anything!
            </Typography>

            {/* Suggested prompts */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 700 }}>
              {[
                "What's in our latest project updates?",
                'Analyze team performance metrics',
                'Create a marketing campaign plan',
                'Help me automate daily standup',
              ].map((prompt, index) => (
                <Paper
                  key={index}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => setInput(prompt)}
                >
                  <Typography variant="body2" color="text.secondary">
                    {prompt}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <ChatMessageCard key={message.id} message={message} userId={userId} orgId={orgId} />
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Loading indicator */}
        {(isLoading || isStreaming) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {isStreaming ? 'Responding...' : 'Thinking...'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Fab
          size="small"
          color="primary"
          onClick={() => scrollToBottom('smooth')}
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 24,
            zIndex: 1,
          }}
        >
          <ScrollDownIcon />
        </Fab>
      )}

      {/* Input Area */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={3}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Vibodh AI anything..."
            disabled={isLoading || isStreaming}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!input.trim() || isLoading || isStreaming}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            {isLoading || isStreaming ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>

        {/* Helper text */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Paper>
    </Box>
  );
}
