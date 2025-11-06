-- Add verification status fields to trade_submissions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trade_submissions' AND column_name = 'verification_status') THEN
    ALTER TABLE trade_submissions 
    ADD COLUMN verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trade_submissions' AND column_name = 'verified_at') THEN
    ALTER TABLE trade_submissions 
    ADD COLUMN verified_at timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trade_submissions' AND column_name = 'verifier_id') THEN
    ALTER TABLE trade_submissions 
    ADD COLUMN verifier_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Ensure twitter_screenshot_url column exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'trade_submissions' AND column_name = 'twitter_screenshot_url') THEN
    ALTER TABLE trade_submissions 
    ADD COLUMN twitter_screenshot_url text;
  END IF;
END $$;

-- Update RLS policies for trade_submissions to ensure they're all enabled
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all submissions" ON trade_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON trade_submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON trade_submissions;
DROP POLICY IF EXISTS "Users can delete own submissions" ON trade_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON trade_submissions;
DROP POLICY IF EXISTS "Admins can update all submissions" ON trade_submissions;
DROP POLICY IF EXISTS "Admins can manage all submissions" ON trade_submissions;

-- Recreate policies with proper checks
CREATE POLICY "Users can view all submissions"
ON trade_submissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own submissions"
ON trade_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
ON trade_submissions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions"
ON trade_submissions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
ON trade_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all submissions"
ON trade_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert submissions"
ON trade_submissions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete submissions"
ON trade_submissions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create storage bucket for Twitter screenshots if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('twitter-screenshots', 'twitter-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for twitter-screenshots
DROP POLICY IF EXISTS "Anyone can view twitter screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their twitter screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their twitter screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their twitter screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all twitter screenshots" ON storage.objects;

CREATE POLICY "Anyone can view twitter screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'twitter-screenshots');

CREATE POLICY "Users can upload their twitter screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'twitter-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their twitter screenshots"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'twitter-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their twitter screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'twitter-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all twitter screenshots"
ON storage.objects FOR ALL
USING (
  bucket_id = 'twitter-screenshots'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add index for faster verification queries
CREATE INDEX IF NOT EXISTS idx_trade_submissions_verification_status 
ON trade_submissions(verification_status);

CREATE INDEX IF NOT EXISTS idx_trade_submissions_user_date 
ON trade_submissions(user_id, submission_date);