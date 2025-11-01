import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  org_id: string
}

interface Organization {
  id: string
  name: string
  created_at: string
  settings?: any
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
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
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile?.org_id) {
    redirect('/dashboard')
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.org_id)
    .single<Organization>()

  // Pass user, profile, and org data to client wrapper
  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email || '',
      }}
      profile={{
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        orgId: profile.org_id,
      }}
      organization={organization || {
        id: profile.org_id,
        name: 'Unknown Organization',
        created_at: new Date().toISOString(),
      }}
    >
      {children}
    </AppShell>
  )
}
