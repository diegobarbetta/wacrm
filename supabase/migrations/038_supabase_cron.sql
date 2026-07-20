-- Free-tier scheduling lives in Supabase instead of Vercel Cron.
-- Runtime values are read from Vault secrets named wacrm_site_url and
-- wacrm_cron_secret; neither value is committed to the repository.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.invoke_wacrm_cron(p_path text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions, vault, net
AS $$
DECLARE
  v_site_url text;
  v_cron_secret text;
  v_request_id bigint;
BEGIN
  SELECT decrypted_secret INTO v_site_url
  FROM vault.decrypted_secrets
  WHERE name = 'wacrm_site_url'
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT decrypted_secret INTO v_cron_secret
  FROM vault.decrypted_secrets
  WHERE name = 'wacrm_cron_secret'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_site_url IS NULL OR v_cron_secret IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT net.http_get(
    url := rtrim(v_site_url, '/') || p_path,
    headers := jsonb_build_object('x-cron-secret', v_cron_secret),
    timeout_milliseconds := 60000
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION private.invoke_wacrm_cron(text)
  FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job
  WHERE jobname = 'wacrm-resume-automations';
  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  SELECT jobid INTO v_job_id FROM cron.job
  WHERE jobname = 'wacrm-sweep-flows';
  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  PERFORM cron.schedule(
    'wacrm-resume-automations',
    '*/5 * * * *',
    $cron$SELECT private.invoke_wacrm_cron('/api/automations/cron');$cron$
  );

  PERFORM cron.schedule(
    'wacrm-sweep-flows',
    '17 * * * *',
    $cron$SELECT private.invoke_wacrm_cron('/api/flows/cron');$cron$
  );
END;
$$;
