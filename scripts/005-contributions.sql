-- Group gifting + cash/honeymoon funds: let multiple guests contribute money
-- toward a single gift or a cash fund goal. Idempotent (re-run on each setup).

-- Flag a registry item as accepting guest contributions, and distinguish a
-- regular product from a cash fund.
ALTER TABLE registry_items
  ADD COLUMN IF NOT EXISTS is_group_gift BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE registry_items
  ADD COLUMN IF NOT EXISTS item_type VARCHAR(20) NOT NULL DEFAULT 'product';

-- Individual guest contributions toward a group gift / cash fund.
CREATE TABLE IF NOT EXISTS gift_contributions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_item_id UUID NOT NULL REFERENCES registry_items(id) ON DELETE CASCADE,
  guest_name       VARCHAR(120) NOT NULL,
  guest_email      VARCHAR(160),
  amount           NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  message          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_contributions_item
  ON gift_contributions(registry_item_id);
