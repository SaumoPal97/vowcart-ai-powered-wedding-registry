-- Store each couple's lifestyle questionnaire so AI recommendations stay
-- personalized beyond onboarding (e.g. the Find Gifts "For You" tab).
ALTER TABLE couples ADD COLUMN IF NOT EXISTS preferences JSONB;
