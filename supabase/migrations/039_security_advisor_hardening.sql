-- Address actionable Supabase Security Advisor findings while preserving the
-- small RPC surface intentionally used by the application.

-- Public buckets serve object URLs without a SELECT policy. Removing these
-- broad policies prevents anonymous clients from listing every object.
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Flow media is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Chat media is publicly readable" ON storage.objects;

-- Keep extension-owned objects outside the API-exposed public schema.
ALTER EXTENSION vector SET SCHEMA extensions;

-- Pin every public function to trusted schemas. For SECURITY DEFINER
-- functions, remove inherited execution before granting the intended surface.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature, p.prosecdef
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path TO pg_catalog, public, extensions',
      fn.signature
    );

    IF fn.prosecdef THEN
      EXECUTE format(
        'REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',
        fn.signature
      );
    END IF;
  END LOOP;
END;
$$;

-- Server-side jobs and webhook handlers use the secret service role.
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Intentional client RPC surface. Each function performs its own auth/account
-- checks internally; all other SECURITY DEFINER functions remain private.
GRANT EXECUTE ON FUNCTION public.peek_invitation(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_account_member(uuid, public.account_role_enum)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_member_role(uuid, public.account_role_enum)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_account_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_account_ownership(uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_presence(text) TO authenticated;
