-- Create trade_submissions table
CREATE TABLE public.trade_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trade_idea TEXT NOT NULL,
  chart_image_url TEXT,
  twitter_link TEXT NOT NULL,
  market_pair TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, submission_date) -- Ensure one submission per day per user
);

-- Enable RLS on trade_submissions
ALTER TABLE public.trade_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for trade_submissions
CREATE POLICY "Users can view all submissions" ON public.trade_submissions FOR SELECT USING (true);
CREATE POLICY "Users can insert own submissions" ON public.trade_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON public.trade_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own submissions" ON public.trade_submissions FOR DELETE USING (auth.uid() = user_id);

-- Create challenge_participants table to track who joined the challenge
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  challenge_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_submissions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on challenge_participants
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for challenge_participants
CREATE POLICY "Anyone can view participants" ON public.challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can insert own participation" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update participant stats
CREATE OR REPLACE FUNCTION public.update_participant_stats()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
  submission_count INTEGER;
  streak_count INTEGER;
  latest_date DATE;
  consecutive_days INTEGER := 0;
  current_date_check DATE;
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

  -- Update participant stats
  UPDATE public.challenge_participants
  SET
    total_submissions = submission_count,
    current_streak = consecutive_days,
    longest_streak = GREATEST(longest_streak, consecutive_days),
    completion_rate = ROUND((submission_count::DECIMAL / GREATEST(1, EXTRACT(days FROM (CURRENT_DATE - challenge_start_date + 1)))) * 100, 2),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats on new submission
CREATE TRIGGER update_stats_on_submission
  AFTER INSERT ON public.trade_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_participant_stats();

-- Create storage bucket for chart images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trade-charts', 'trade-charts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for chart uploads
CREATE POLICY "Anyone can view chart images" ON storage.objects FOR SELECT USING (bucket_id = 'trade-charts');
CREATE POLICY "Authenticated users can upload charts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own charts" ON storage.objects FOR UPDATE USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own charts" ON storage.objects FOR DELETE USING (bucket_id = 'trade-charts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for trade_submissions and challenge_participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participants;

-- Set replica identity for realtime
ALTER TABLE public.trade_submissions REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_participants REPLICA IDENTITY FULL;