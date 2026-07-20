-- Brazilian deployments create accounts and deals in BRL by default.
-- Existing accounts retain their explicitly selected currency.
ALTER TABLE accounts
  ALTER COLUMN default_currency SET DEFAULT 'BRL';
