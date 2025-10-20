import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewChatPage from './NewChatPage'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>
}) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) {
    redirect('/dashboard')
  }

  // Get session ID from URL query param
  const params = await searchParams
  const sessionId = params.session || undefined

  return <NewChatPage userId={user.id} orgId={profile.org_id} sessionId={sessionId} />
}
