-- Create scorecards table for tracking user scores per campaign
CREATE TABLE public.scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  consistency_score INTEGER NOT NULL DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 70),
  rule_score INTEGER NOT NULL DEFAULT 0 CHECK (rule_score >= 0 AND rule_score <= 20),
  discipline_score INTEGER NOT NULL DEFAULT 0 CHECK (discipline_score >= 0 AND discipline_score <= 10),
  total_score INTEGER GENERATED ALWAYS AS (consistency_score + rule_score + discipline_score) STORED,
  completed_days INTEGER NOT NULL DEFAULT 0 CHECK (completed_days >= 0 AND completed_days <= 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, campaign_id)
);

-- Add missing columns to trade_submissions for scorecard tracking
ALTER TABLE public.trade_submissions 
ADD COLUMN IF NOT EXISTS has_hashtag BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_tagged_account BOOLEAN DEFAULT false;

-- Enable RLS on scorecards
ALTER TABLE public.scorecards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scorecards
CREATE POLICY "Users can view all scorecards" ON public.scorecards
FOR SELECT USING (true);

CREATE POLICY "Users can insert own scorecard" ON public.scorecards
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scorecard" ON public.scorecards
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scorecards" ON public.scorecards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Function to calculate and update scorecard when a submission is made
CREATE OR REPLACE FUNCTION public.update_scorecard_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign_id UUID;
  v_consistency_score INTEGER;
  v_rule_score INTEGER;
  v_discipline_score INTEGER;
  v_completed_days INTEGER;
BEGIN
  -- Get campaign ID from the submission
  v_campaign_id := NEW.campaign_id;
  
  IF v_campaign_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate consistency score (10 points per valid day)
  SELECT COUNT(DISTINCT submission_date) * 10 INTO v_consistency_score
  FROM public.trade_submissions
  WHERE user_id = NEW.user_id 
    AND campaign_id = v_campaign_id;
  
  -- Cap at 70
  v_consistency_score := LEAST(v_consistency_score, 70);

  -- Calculate rule score (hashtag = 2pts, tag = 1pt per day)
  SELECT 
    LEAST(
      COALESCE(SUM(CASE WHEN has_hashtag THEN 2 ELSE 0 END), 0) +
      COALESCE(SUM(CASE WHEN has_tagged_account THEN 1 ELSE 0 END), 0),
      20
    ) INTO v_rule_score
  FROM public.trade_submissions
  WHERE user_id = NEW.user_id 
    AND campaign_id = v_campaign_id;

  -- Calculate discipline score (chart = 1pt, analysis = 1pt per day)
  SELECT 
    LEAST(
      COALESCE(SUM(CASE WHEN chart_image_url IS NOT NULL AND chart_image_url != '' THEN 1 ELSE 0 END), 0) +
      COALESCE(SUM(CASE WHEN trade_idea IS NOT NULL AND LENGTH(trade_idea) > 10 THEN 1 ELSE 0 END), 0),
      10
    ) INTO v_discipline_score
  FROM public.trade_submissions
  WHERE user_id = NEW.user_id 
    AND campaign_id = v_campaign_id;

  -- Count completed days
  SELECT COUNT(DISTINCT submission_date) INTO v_completed_days
  FROM public.trade_submissions
  WHERE user_id = NEW.user_id 
    AND campaign_id = v_campaign_id;

  -- Upsert scorecard
  INSERT INTO public.scorecards (
    user_id, 
    campaign_id, 
    consistency_score, 
    rule_score, 
    discipline_score, 
    completed_days,
    updated_at
  )
  VALUES (
    NEW.user_id,
    v_campaign_id,
    v_consistency_score,
    v_rule_score,
    v_discipline_score,
    v_completed_days,
    now()
  )
  ON CONFLICT (user_id, campaign_id) 
  DO UPDATE SET
    consistency_score = v_consistency_score,
    rule_score = v_rule_score,
    discipline_score = v_discipline_score,
    completed_days = v_completed_days,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Create trigger to update scorecard on submission
DROP TRIGGER IF EXISTS trigger_update_scorecard ON public.trade_submissions;
CREATE TRIGGER trigger_update_scorecard
AFTER INSERT OR UPDATE ON public.trade_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_scorecard_on_submission();

-- Function to get leaderboard with scores
CREATE OR REPLACE FUNCTION public.get_scorecard_leaderboard(p_campaign_id UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  consistency_score INTEGER,
  rule_score INTEGER,
  discipline_score INTEGER,
  total_score INTEGER,
  completed_days INTEGER,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.user_id,
    p.username,
    p.full_name,
    s.consistency_score,
    s.rule_score,
    s.discipline_score,
    s.total_score,
    s.completed_days,
    ROW_NUMBER() OVER (ORDER BY s.total_score DESC, s.completed_days DESC, s.updated_at ASC) as rank
  FROM public.scorecards s
  JOIN public.profiles p ON p.id = s.user_id
  WHERE s.campaign_id = p_campaign_id
    AND p.is_disqualified = false
  ORDER BY s.total_score DESC, s.completed_days DESC, s.updated_at ASC;
$$;