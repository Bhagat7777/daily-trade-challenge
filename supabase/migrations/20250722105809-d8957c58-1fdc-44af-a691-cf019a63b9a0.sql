-- Update competition start date to July 24th, 2025

-- First, update existing challenge participants to have July 24th, 2025 as their start date
UPDATE public.challenge_participants 
SET challenge_start_date = '2025-07-24'
WHERE challenge_start_date != '2025-07-24';

-- Update the default value for challenge_start_date to July 24th, 2025
ALTER TABLE public.challenge_participants 
ALTER COLUMN challenge_start_date SET DEFAULT '2025-07-24';

-- Update the submission trigger function to use July 24th as the start date for new participants
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
BEGIN
  -- Get or create participant record with July 24th, 2025 as start date
  INSERT INTO public.challenge_participants (user_id, challenge_start_date)
  VALUES (NEW.user_id, '2025-07-24')
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current stats
  SELECT * INTO participant_record
  FROM public.challenge_participants
  WHERE user_id = NEW.user_id;

  -- Calculate total submissions
  SELECT COUNT(*) INTO submission_count
  FROM public.trade_submissions
  WHERE user_id = NEW.user_id;

  -- Calculate current streak (consecutive days from latest submission backwards)
  SELECT MAX(submission_date) INTO latest_date
  FROM public.trade_submissions
  WHERE user_id = NEW.user_id;

  current_date_check := latest_date;
  WHILE EXISTS (
    SELECT 1 FROM public.trade_submissions
    WHERE user_id = NEW.user_id AND submission_date = current_date_check
  ) LOOP
    consecutive_days := consecutive_days + 1;
    current_date_check := current_date_check - INTERVAL '1 day';
  END LOOP;

  -- Calculate days since challenge start (July 24th, 2025) for completion rate
  SELECT (CURRENT_DATE - '2025-07-24'::date + 1) INTO days_since_start;
  
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