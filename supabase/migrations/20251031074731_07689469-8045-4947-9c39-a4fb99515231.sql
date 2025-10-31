-- Add new columns to campaigns table for full campaign management
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS rules text,
ADD COLUMN IF NOT EXISTS rewards jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended', 'archived'));

-- Create campaign_types enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_type') THEN
    CREATE TYPE campaign_type AS ENUM ('trading_challenge', 'payout_contest', 'giveaway', 'streak_challenge', 'other');
  END IF;
END $$;

-- Update type column to use enum (keep text for flexibility)
COMMENT ON COLUMN campaigns.type IS 'Campaign type: trading_challenge, payout_contest, giveaway, streak_challenge, other';

-- Create function to auto-generate slug
CREATE OR REPLACE FUNCTION generate_campaign_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
    
    -- Ensure uniqueness by appending a number if needed
    IF EXISTS (SELECT 1 FROM campaigns WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
      NEW.slug := NEW.slug || '-' || extract(epoch from now())::bigint;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS generate_slug_trigger ON campaigns;
CREATE TRIGGER generate_slug_trigger
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION generate_campaign_slug();

-- Create function to auto-update campaign status based on dates
CREATE OR REPLACE FUNCTION update_campaign_status()
RETURNS void AS $$
BEGIN
  -- Update to 'live' if start date has passed and end date hasn't
  UPDATE campaigns
  SET status = 'live', updated_at = now()
  WHERE status = 'upcoming' 
    AND start_date <= CURRENT_DATE 
    AND end_date >= CURRENT_DATE;
  
  -- Update to 'ended' if end date has passed
  UPDATE campaigns
  SET status = 'ended', is_active = false, updated_at = now()
  WHERE status IN ('live', 'upcoming')
    AND end_date < CURRENT_DATE;
    
  -- Update is_active based on status
  UPDATE campaigns
  SET is_active = (status = 'live'), updated_at = now()
  WHERE (status = 'live' AND is_active = false)
     OR (status != 'live' AND is_active = true);
END;
$$ LANGUAGE plpgsql;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);

-- Update existing campaigns to have proper status
UPDATE campaigns
SET status = CASE
  WHEN end_date < CURRENT_DATE THEN 'ended'
  WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'live'
  ELSE 'upcoming'
END,
is_active = CASE
  WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN true
  ELSE false
END
WHERE status IS NULL OR status NOT IN ('upcoming', 'live', 'ended', 'archived');