-- Update all submissions to link to active campaign and recalculate day numbers
DO $$
DECLARE
  active_camp_id UUID;
  active_camp_start DATE;
BEGIN
  -- Get the active campaign details
  SELECT id, start_date INTO active_camp_id, active_camp_start
  FROM public.campaigns
  WHERE is_active = true
  ORDER BY start_date DESC
  LIMIT 1;
  
  IF active_camp_id IS NOT NULL THEN
    -- Update ALL submissions to link to active campaign
    UPDATE public.trade_submissions
    SET 
      campaign_id = active_camp_id,
      day_number = (submission_date - active_camp_start + 1);
    
    RAISE NOTICE 'Updated % submissions to campaign %', 
      (SELECT COUNT(*) FROM public.trade_submissions WHERE campaign_id = active_camp_id),
      active_camp_id;
  ELSE
    RAISE NOTICE 'No active campaign found';
  END IF;
END $$;