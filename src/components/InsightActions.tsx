'use client'

import { Button, Box } from '@mui/material'
import { AutoAwesome, Refresh } from '@mui/icons-material'

interface InsightActionsProps {
  orgId: string
}

export default function InsightActions({ orgId }: InsightActionsProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <form action={`/api/insights/generate`} method="POST">
        <input type="hidden" name="orgId" value={orgId} />
        <Button
          type="submit"
          variant="contained"
          startIcon={<AutoAwesome />}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Generate Insights
        </Button>
      </form>
      <Button
        variant="outlined"
        startIcon={<Refresh />}
        onClick={handleRefresh}
      >
        Refresh
      </Button>
    </Box>
  )
}
