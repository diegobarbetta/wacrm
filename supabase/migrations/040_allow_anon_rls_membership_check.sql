-- Anonymous reads still pass through account-scoped RLS policies. Those
-- policies call is_account_member(), which safely returns false when
-- auth.uid() is null. EXECUTE is therefore required for RLS to return an empty
-- result instead of surfacing a permission error to unauthenticated clients.
GRANT EXECUTE ON FUNCTION public.is_account_member(uuid, public.account_role_enum)
  TO anon;
