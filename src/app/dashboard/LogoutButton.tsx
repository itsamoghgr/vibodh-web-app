'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import { ExitToApp as LogoutIcon } from '@mui/icons-material'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button
      variant="outlined"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Logout
    </Button>
  )
}
