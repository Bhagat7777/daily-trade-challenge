-- Fix the update_participant_stats function with proper date handling
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
  -- Get or create participant record
  INSERT INTO public.challenge_participants (user_id, challenge_start_date)
  VALUES (NEW.user_id, NEW.submission_date)
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

  -- Calculate days since challenge start for completion rate
  SELECT (CURRENT_DATE - challenge_start_date + 1) INTO days_since_start
  FROM public.challenge_participants
  WHERE user_id = NEW.user_id;

  -- Update participant stats
  UPDATE public.challenge_participants
  SET
    total_submissions = submission_count,
    current_streak = consecutive_days,
    longest_streak = GREATEST(longest_streak, consecutive_days),
    completion_rate = ROUND((submission_count::DECIMAL / GREATEST(1, days_since_start)) * 100, 2),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$function$;

-- Create trigger for trade submissions
DROP TRIGGER IF EXISTS update_participant_stats_trigger ON public.trade_submissions;
CREATE TRIGGER update_participant_stats_trigger
  AFTER INSERT ON public.trade_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_stats();