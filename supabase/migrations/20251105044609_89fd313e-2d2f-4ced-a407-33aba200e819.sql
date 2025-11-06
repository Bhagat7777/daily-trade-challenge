-- Drop all triggers first, then the function
DROP TRIGGER IF EXISTS calculate_day_number_trigger ON public.trade_submissions;
DROP TRIGGER IF EXISTS set_day_number_trigger ON public.trade_submissions;
DROP TRIGGER IF EXISTS set_day_number_on_submission ON public.trade_submissions;
DROP FUNCTION IF EXISTS public.calculate_day_number() CASCADE;

-- Recreate the function with proper day_number calculation
CREATE OR REPLACE FUNCTION public.calculate_day_number()
RETURNS TRIGGER AS $$
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
      start_date := '2025-07-24'::date;
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
      -- Update the submission with the campaign_id
      NEW.campaign_id := campaign_record.id;
    ELSE
      start_date := '2025-07-24'::date;
    END IF;
  END IF;

  -- Calculate which day of the challenge this submission represents
  submission_day := (NEW.submission_date - start_date + 1);
  
  -- Always set day_number to help with tracking
  NEW.day_number := submission_day;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER calculate_day_number_trigger
  BEFORE INSERT OR UPDATE ON public.trade_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_day_number();

-- Update existing submissions to have day_number calculated
UPDATE public.trade_submissions
SET day_number = CASE 
  WHEN campaign_id IS NOT NULL THEN
    (SELECT (trade_submissions.submission_date - c.start_date + 1)
    FROM campaigns c 
    WHERE c.id = trade_submissions.campaign_id)
  ELSE
    (trade_submissions.submission_date - DATE '2025-07-24' + 1)
END
WHERE day_number IS NULL;