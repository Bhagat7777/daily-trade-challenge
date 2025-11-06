-- Update participant stats function to work with campaigns
CREATE OR REPLACE FUNCTION public.update_participant_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  participant_record RECORD;
  submission_count INTEGER;
  streak_count INTEGER;
  latest_date DATE;
  consecutive_days INTEGER := 0;
  current_date_check DATE;
  days_since_start INTEGER;
  campaign_record RECORD;
BEGIN
  -- Get campaign info from the submission
  IF NEW.campaign_id IS NOT NULL THEN
    SELECT * INTO campaign_record
    FROM public.campaigns
    WHERE id = NEW.campaign_id;
  ELSE
    -- Fall back to active campaign if no campaign_id is provided
    SELECT * INTO campaign_record
    FROM public.campaigns
    WHERE is_active = true
    ORDER BY start_date DESC
    LIMIT 1;
  END IF;

  -- If no campaign found, use default July 24th, 2025
  IF campaign_record IS NULL THEN
    campaign_record.start_date := '2025-07-24'::date;
  END IF;

  -- Get or create participant record with campaign start date
  INSERT INTO public.challenge_participants (user_id, challenge_start_date, campaign_id)
  VALUES (NEW.user_id, campaign_record.start_date, campaign_record.id)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    campaign_id = COALESCE(challenge_participants.campaign_id, campaign_record.id),
    challenge_start_date = COALESCE(challenge_participants.challenge_start_date, campaign_record.start_date);

  -- Get current stats
  SELECT * INTO participant_record
  FROM public.challenge_participants
  WHERE user_id = NEW.user_id;

  -- Calculate total submissions for this campaign
  IF campaign_record.id IS NOT NULL THEN
    SELECT COUNT(*) INTO submission_count
    FROM public.trade_submissions
    WHERE user_id = NEW.user_id 
    AND (campaign_id = campaign_record.id OR campaign_id IS NULL);
  ELSE
    SELECT COUNT(*) INTO submission_count
    FROM public.trade_submissions
    WHERE user_id = NEW.user_id;
  END IF;

  -- Calculate current streak (consecutive days from latest submission backwards)
  SELECT MAX(submission_date) INTO latest_date
  FROM public.trade_submissions
  WHERE user_id = NEW.user_id;

  IF latest_date IS NOT NULL THEN
    current_date_check := latest_date;
    WHILE EXISTS (
      SELECT 1 FROM public.trade_submissions
      WHERE user_id = NEW.user_id AND submission_date = current_date_check
    ) LOOP
      consecutive_days := consecutive_days + 1;
      current_date_check := current_date_check - INTERVAL '1 day';
    END LOOP;
  END IF;

  -- Calculate days since campaign start for completion rate
  SELECT (CURRENT_DATE - campaign_record.start_date + 1) INTO days_since_start;
  
  -- Ensure days_since_start is at least 1 to avoid division by zero
  days_since_start := GREATEST(1, days_since_start);

  -- Update participant stats
  UPDATE public.challenge_participants
  SET
    total_submissions = submission_count,
    current_streak = consecutive_days,
    longest_streak = GREATEST(longest_streak, consecutive_days),
    completion_rate = ROUND((submission_count::DECIMAL / days_since_start) * 100, 2),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$function$;

-- Update calculate_day_number function to use campaign dates
CREATE OR REPLACE FUNCTION public.calculate_day_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
  
  -- Ensure day_number is between 1 and campaign days_count (or 15 by default)
  IF campaign_record IS NOT NULL THEN
    IF submission_day >= 1 AND submission_day <= campaign_record.days_count THEN
      NEW.day_number := submission_day;
    ELSE
      NEW.day_number := NULL;
    END IF;
  ELSE
    IF submission_day >= 1 AND submission_day <= 15 THEN
      NEW.day_number := submission_day;
    ELSE
      NEW.day_number := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create triggers if they don't exist
DO $$ 
BEGIN
  -- Check and create trigger for calculate_day_number
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_day_number_trigger' 
    AND tgrelid = 'trade_submissions'::regclass
  ) THEN
    CREATE TRIGGER set_day_number_trigger
    BEFORE INSERT ON trade_submissions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_day_number();
  END IF;

  -- Check and create trigger for update_participant_stats
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_stats_trigger' 
    AND tgrelid = 'trade_submissions'::regclass
  ) THEN
    CREATE TRIGGER update_stats_trigger
    AFTER INSERT ON trade_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_participant_stats();
  END IF;
END $$;