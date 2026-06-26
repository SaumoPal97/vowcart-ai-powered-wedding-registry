-- VowCart — Shopify UCP fields on registry items.
-- Stores the merchant checkout handoff URL + UCP variant id so a guest can be
-- redirected to the real Shopify checkout. Safe to re-run.

ALTER TABLE registry_items
  ADD COLUMN IF NOT EXISTS checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS variant_id   TEXT;
