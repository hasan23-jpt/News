/*
# Set up server-side cron for auto-news posting

1. Extensions
- pg_cron: PostgreSQL cron scheduler (runs jobs on a schedule inside the database)
- pg_net: HTTP client for PostgreSQL (allows cron jobs to call the edge function URL)

2. Scheduled job
- Calls the auto-news edge function every 1 hour via HTTP POST
- This ensures news is posted automatically even when no browser is open
- The edge function fetches Google News, generates article content, and inserts into the articles table

3. Notes
- The cron job runs as the postgres superuser (required for pg_net)
- The edge function URL is constructed from the project URL
- pg_cron is added to shared_preload_libraries which requires a database restart on some setups
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the auto-news edge function to run every hour
-- The edge function handles deduplication (skips articles posted in last 12 hours with same slug)
SELECT cron.schedule(
  'auto-news-hourly',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://inftzfvqtujcwmpwnvjl.supabase.co/functions/v1/auto-news',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZnR6ZnZxdHVqY3dtcHdudmpsIiwicm9sISI6ImFub24iLCJpYXQiOjE3ODc3Mjk2OTIsImV4cCI6MjEwMzMwNTY5Mn0.VrIbE19lTCocLUD5JwlDej7sXbJvp-4fLD1GX1eppN8"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
