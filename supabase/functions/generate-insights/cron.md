# Cron Setup for Generate Insights Edge Function

## Supabase Cron Configuration

To run this function nightly, add it to your Supabase project's cron jobs.

### Using Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Cron Jobs** (pg_cron extension)
3. Create a new cron job:

```sql
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the insight generation to run nightly at 2 AM UTC
SELECT cron.schedule(
  'generate-nightly-insights',
  '0 2 * * *',  -- Run at 2:00 AM UTC every day
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-insights',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_ANON_KEY'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

### Alternative: Using Supabase CLI

```bash
# Deploy the function
supabase functions deploy generate-insights

# Set environment variables
supabase secrets set VIBODH_API_URL=https://your-api-url.com

# The cron schedule should be configured in the dashboard or via SQL
```

### Cron Schedule Format

The cron expression `'0 2 * * *'` means:
- Minute: 0
- Hour: 2 (2 AM)
- Day of month: * (every day)
- Month: * (every month)
- Day of week: * (every day)

### Other Schedule Examples

```
'0 0 * * *'     # Midnight every day
'0 */6 * * *'   # Every 6 hours
'0 2 * * 1'     # 2 AM every Monday
'0 2 1 * *'     # 2 AM on the 1st of every month
```

## Environment Variables Required

Make sure these are set in your Supabase project:

- `SUPABASE_URL` - Automatically available
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically available
- `VIBODH_API_URL` - Your backend API URL (set via `supabase secrets set`)

## Testing the Function Manually

```bash
# Using curl
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-insights \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# Using Supabase CLI
supabase functions invoke generate-insights
```

## Monitoring

Check the function logs in the Supabase dashboard:
1. Go to **Edge Functions**
2. Select `generate-insights`
3. View **Logs** tab

## Troubleshooting

If the cron job fails to run:

1. Check that pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Verify the cron job is scheduled:
   ```sql
   SELECT * FROM cron.job;
   ```

3. Check cron job run history:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```

4. Remove a cron job if needed:
   ```sql
   SELECT cron.unschedule('generate-nightly-insights');
   ```
