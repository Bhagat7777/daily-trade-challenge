-- Fix the day_number calculation trigger to use campaign start_date correctly
CREATE OR REPLACE FUNCTION public.calculate_day_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  start_date DATE;
  submission_day INTEGER;
  campaign_record RECORD;
BEGIN
  -- Get campaign info
  IF NEW.campaign_id IS NOT NULL THEN
    SELECT * INTO campaign_record
    FROM public.campaigns
    WHERE id = NEW.campaign_id;
    
    IF campaign_record IS NOT NULL THEN
      start_date := campaign_record.start_date;
    ELSE
      -- If no campaign found, try to get active campaign
      SELECT * INTO campaign_record
      FROM public.campaigns
      WHERE is_active = true
      ORDER BY start_date DESC
      LIMIT 1;
      
      IF campaign_record IS NOT NULL THEN
        start_date := campaign_record.start_date;
        NEW.campaign_id := campaign_record.id;
      ELSE
        -- Fallback to default date
        start_date := '2025-07-24'::date;
      END IF;
    END IF;
  ELSE
    -- Try to get active campaign
    SELECT * INTO campaign_record
    FROM public.campaigns
    WHERE is_active = true
    ORDER BY start_date DESC
    LIMIT 1;
    
    IF campaign_record IS NOT NULL THEN
      start_date := campaign_record.start_date;
      NEW.campaign_id := campaign_record.id;
    ELSE
      start_date := '2025-07-24'::date;
    END IF;
  END IF;

  -- Calculate which day of the challenge this submission represents
  submission_day := (NEW.submission_date - start_date + 1);
  
  -- Set day_number
  NEW.day_number := submission_day;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS calculate_day_number_trigger ON public.trade_submissions;
CREATE TRIGGER calculate_day_number_trigger
  BEFORE INSERT OR UPDATE ON public.trade_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_day_number();

-- Update existing submissions to recalculate day_numbers based on active campaign
DO $$
DECLARE
  active_camp RECORD;
BEGIN
  -- Get the active campaign
  SELECT * INTO active_camp
  FROM public.campaigns
  WHERE is_active = true
  ORDER BY start_date DESC
  LIMIT 1;
  
  IF active_camp IS NOT NULL THEN
    -- Update submissions with campaign_id set
    UPDATE public.trade_submissions
    SET 
      campaign_id = COALESCE(campaign_id, active_camp.id),
      day_number = (submission_date - active_camp.start_date + 1)
    WHERE campaign_id IS NULL OR campaign_id = active_camp.id;
    
    RAISE NOTICE 'Updated submissions for campaign: %', active_camp.title;
  END IF;
END $$;