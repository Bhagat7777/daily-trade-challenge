-- Force trigger recalculation by updating updated_at
UPDATE public.trade_submissions
SET updated_at = NOW()
WHERE campaign_id = (SELECT id FROM campaigns WHERE is_active = true LIMIT 1);