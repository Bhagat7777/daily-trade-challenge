
-- Fix: Restrict click tracking to only active campaigns
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.propfirm_campaign_clicks;

CREATE POLICY "Users can track clicks for active campaigns"
  ON public.propfirm_campaign_clicks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.propfirm_campaigns
      WHERE id = campaign_id
      AND is_enabled = true
      AND start_time <= now()
      AND end_time >= now()
    )
  );
