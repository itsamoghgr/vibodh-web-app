'use client'

import { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import { Add, Delete, Sync } from '@mui/icons-material'

interface ConnectButtonProps {
  integration: {
    id: string
    name: string
  }
  isConnected: boolean
  connectionId?: string
  orgId: string
}

export default function ConnectButton({
  integration,
  isConnected,
  connectionId,
  orgId,
}: ConnectButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!orgId || orgId.trim() === '') {
      alert('Organization ID is missing. Please refresh the page and try again.')
      return
    }

    setLoading(true)

    try {
      // Redirect to backend OAuth URL
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Different OAuth endpoints for different integrations
      let url: string
      if (integration.id === 'clickup') {
        url = `${backendUrl}/api/clickup/connect?org_id=${orgId}`
      } else {
        url = `${backendUrl}/api/connect/${integration.id}?org_id=${orgId}`
      }

      console.log('Connecting to:', url, 'org_id:', orgId)
      window.location.href = url
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect. Please try again.')
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return
    }

    setLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/api/connections/${connectionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      alert('Failed to disconnect. Please try again.')
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Different sync endpoints for different integrations
      let url: string
      if (integration.id === 'clickup') {
        url = `${backendUrl}/api/clickup/sync/${connectionId}?org_id=${orgId}`
      } else {
        url = `${backendUrl}/api/ingest/${integration.id}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: integration.id === 'clickup' ? undefined : JSON.stringify({
          org_id: orgId,
          connection_id: connectionId,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        let message: string
        if (integration.id === 'clickup') {
          message = `Sync completed!\n\n` +
            `✅ Synced: ${result.message}\n` +
            `📝 Documents ingested: ${result.documents_ingested}\n\n` +
            `Click "View Sync Status" to see details.`
        } else {
          message = `Sync completed!\n\n` +
            `📥 Fetched: ${result.documents_fetched} messages\n` +
            `✅ Created: ${result.documents_created} new documents\n` +
            `⊘ Skipped: ${result.documents_skipped || 0} duplicates\n` +
            `🧠 Embeddings: ${result.embeddings_generated} generated\n\n` +
            `Click "View Sync Status" to see synced channels.`
        }

        alert(message)
        window.location.href = '/dashboard/sync-status'
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start sync')
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  if (isConnected) {
    return (
      <>
        <Button
          variant="outlined"
          color="primary"
          startIcon={loading ? <CircularProgress size={16} /> : <Sync />}
          onClick={handleSync}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Sync Now
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
          onClick={handleDisconnect}
          disabled={loading}
        >
          Disconnect
        </Button>
      </>
    )
  }

  return (
    <Button
      variant="contained"
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Add />}
      onClick={handleConnect}
      disabled={loading}
      fullWidth
    >
      {loading ? 'Connecting...' : 'Connect'}
    </Button>
  )
}
