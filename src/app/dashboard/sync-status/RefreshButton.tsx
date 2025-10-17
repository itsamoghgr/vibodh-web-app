'use client'

import { Button } from '@mui/material'
import { Refresh } from '@mui/icons-material'

export default function RefreshButton() {
  return (
    <Button
      variant="outlined"
      startIcon={<Refresh />}
      onClick={() => window.location.reload()}
    >
      Refresh
    </Button>
  )
}
