'use client'

import { useState } from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import { Refresh } from '@mui/icons-material'

interface RetryFailedButtonProps {
  orgId: string
  failedCount: number
}

export default function RetryFailedButton({ orgId, failedCount }: RetryFailedButtonProps) {
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const handleRetry = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/retry-failed-embeddings/${orgId}`,
        { method: 'POST' }
      )

      const data = await response.json()

      if (data.success) {
        setSnackbar({
          open: true,
          message: `Successfully retried ${data.succeeded} embeddings`,
          severity: 'success',
        })
        // Reload page after 2 seconds to show updated data
        setTimeout(() => window.location.reload(), 2000)
      } else {
        throw new Error('Failed to retry embeddings')
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to retry embeddings',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        color="warning"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
        onClick={handleRetry}
        disabled={loading || failedCount === 0}
      >
        Retry Failed ({failedCount})
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
