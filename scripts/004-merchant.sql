-- VowCart — Merchant portal schema (Aurora PostgreSQL, system of record).
-- Adds merchants, merchant users, and sponsored campaigns. Also tags the
-- product catalog + registry items with sponsorship so consumer surfaces can
-- render a "Sponsored" label. Safe to re-run.

DO $$ BEGIN
  CREATE TYPE merchant_plan AS ENUM ('FREE', 'PRO', 'GROWTH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Merchants / brands -----------------------------------------------------
CREATE TABLE IF NOT EXISTS merchants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(160) NOT NULL,
  slug                VARCHAR(160) NOT NULL UNIQUE,
  website             VARCHAR(255),
  shopify_merchant_id VARCHAR(160),
  plan                merchant_plan NOT NULL DEFAULT 'FREE',
  -- Catalog brand names this merchant account represents. Demand analytics
  -- aggregate over registry_items / products whose `merchant` is in this list.
  brands              TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);

-- Merchant users (separate from couple `users`) --------------------------
CREATE TABLE IF NOT EXISTS merchant_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id   UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          VARCHAR(120) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_merchant_users_merchant_id ON merchant_users(merchant_id);

-- Sponsored campaigns ----------------------------------------------------
CREATE TABLE IF NOT EXISTS sponsored_campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  product_id  TEXT,
  product_title VARCHAR(200) NOT NULL,
  category    VARCHAR(60) NOT NULL,
  status      campaign_status NOT NULL DEFAULT 'DRAFT',
  budget      NUMERIC(10,2) NOT NULL DEFAULT 0,
  bid         NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date  DATE,
  end_date    DATE,
  -- Lightweight performance counters (would be event-sourced in DynamoDB at
  -- scale; kept here so the demo renders without live traffic).
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks      INTEGER NOT NULL DEFAULT 0,
  purchases   INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_merchant_id ON sponsored_campaigns(merchant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON sponsored_campaigns(status);

-- Sponsorship tags on consumer-facing catalog / registry items -----------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsored_campaign_id UUID;

ALTER TABLE registry_items
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsored_campaign_id UUID;
