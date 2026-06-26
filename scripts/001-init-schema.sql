-- VowCart core schema (Aurora PostgreSQL, system of record)
-- Safe to re-run: guards with IF NOT EXISTS / DO blocks.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums -----------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE item_status AS ENUM ('AVAILABLE', 'RESERVED', 'PURCHASED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE item_priority AS ENUM ('MUST_HAVE', 'NICE_TO_HAVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          VARCHAR(120) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Couples (one per user) ------------------------------------------------
CREATE TABLE IF NOT EXISTS couples (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  partner_one  VARCHAR(120) NOT NULL,
  partner_two  VARCHAR(120) NOT NULL,
  wedding_date DATE,
  location     VARCHAR(200),
  slug         VARCHAR(160) NOT NULL UNIQUE,
  photo        TEXT,
  story        TEXT,
  is_public    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_couples_user_id ON couples(user_id);
CREATE INDEX IF NOT EXISTS idx_couples_slug ON couples(slug);

-- Registries (one per couple) ------------------------------------------
CREATE TABLE IF NOT EXISTS registries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id  UUID NOT NULL UNIQUE REFERENCES couples(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL DEFAULT 'Our Wedding Registry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_registries_couple_id ON registries(couple_id);

-- Product catalog (source for onboarding + AI recommendations) ----------
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  merchant    VARCHAR(120) NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  rating      NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews     INTEGER NOT NULL DEFAULT 0,
  category    VARCHAR(60) NOT NULL,
  image       TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Registry items --------------------------------------------------------
CREATE TABLE IF NOT EXISTS registry_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id UUID NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
  product_id  TEXT,
  merchant    VARCHAR(120) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  image       TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  rating      NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews     INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  category    VARCHAR(60) NOT NULL,
  priority    item_priority NOT NULL DEFAULT 'NICE_TO_HAVE',
  status      item_status NOT NULL DEFAULT 'AVAILABLE',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_registry_items_registry_id ON registry_items(registry_id);
CREATE INDEX IF NOT EXISTS idx_registry_items_status ON registry_items(status);
CREATE INDEX IF NOT EXISTS idx_registry_items_category ON registry_items(category);

-- Purchases (one per registry item) ------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_item_id UUID NOT NULL UNIQUE REFERENCES registry_items(id) ON DELETE CASCADE,
  guest_name       VARCHAR(160) NOT NULL,
  guest_email      VARCHAR(255) NOT NULL,
  shopify_order_id VARCHAR(120),
  thank_you_sent   BOOLEAN NOT NULL DEFAULT false,
  thank_you_sent_at TIMESTAMPTZ,
  purchased_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_purchases_registry_item_id ON purchases(registry_item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_thank_you_sent ON purchases(thank_you_sent);
