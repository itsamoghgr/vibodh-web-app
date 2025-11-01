import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import KnowledgeEvolutionDashboard from './KnowledgeEvolutionDashboard'

export default async function KnowledgeEvolutionPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's org_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) {
    redirect('/dashboard')
  }

  return (
    
      <KnowledgeEvolutionDashboard />
    
  )
}
