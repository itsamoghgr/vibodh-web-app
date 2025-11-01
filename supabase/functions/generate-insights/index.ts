// Supabase Edge Function: Generate AI Insights (Nightly Cron Job)
// This function runs nightly to generate insights for all active organizations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InsightGenerationResult {
  org_id: string
  success: boolean
  insights_created: number
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const apiUrl = Deno.env.get('VIBODH_API_URL') || 'http://localhost:8000'

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')

    if (orgsError) {
      throw new Error(`Failed to fetch organizations: ${orgsError.message}`)
    }

    if (!orgs || orgs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No organizations found',
          results: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Found ${orgs.length} active organizations`)

    // Generate insights for each organization
    const results: InsightGenerationResult[] = []

    for (const org of orgs) {
      try {
        console.log(`Generating insights for org: ${org.name} (${org.id})`)

        // Call backend API to generate insights
        const response = await fetch(`${apiUrl}/api/insights/run/${org.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        results.push({
          org_id: org.id,
          success: result.success || false,
          insights_created: result.insights_created || 0,
        })

        console.log(`✓ Generated ${result.insights_created} insights for ${org.name}`)
      } catch (error) {
        console.error(`✗ Failed to generate insights for ${org.name}:`, error)
        results.push({
          org_id: org.id,
          success: false,
          insights_created: 0,
          error: error.message,
        })
      }
    }

    // Calculate summary stats
    const totalInsights = results.reduce((sum, r) => sum + r.insights_created, 0)
    const successfulOrgs = results.filter((r) => r.success).length

    // Log the job completion
    const logEntry = {
      function_name: 'generate-insights',
      execution_time: new Date().toISOString(),
      organizations_processed: orgs.length,
      successful_orgs: successfulOrgs,
      total_insights_generated: totalInsights,
      results: results,
    }

    console.log('Job completed:', JSON.stringify(logEntry, null, 2))

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated insights for ${successfulOrgs}/${orgs.length} organizations`,
        total_insights: totalInsights,
        results: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
