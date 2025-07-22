-- Add admin functionality to the database schema

-- Add admin fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_challenge_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_disqualified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add rule compliance fields to trade_submissions table
ALTER TABLE public.trade_submissions 
ADD COLUMN IF NOT EXISTS rule_followed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS day_number INTEGER;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Update trade_submissions to calculate day_number automatically
CREATE OR REPLACE FUNCTION public.calculate_day_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  start_date DATE := '2025-07-24';
  submission_day INTEGER;
BEGIN
  -- Calculate which day of the challenge this submission represents
  submission_day := (NEW.submission_date - start_date + 1);
  
  -- Ensure day_number is between 1 and 15
  IF submission_day >= 1 AND submission_day <= 15 THEN
    NEW.day_number := submission_day;
  ELSE
    NEW.day_number := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set day_number
DROP TRIGGER IF EXISTS calculate_day_number_trigger ON public.trade_submissions;
CREATE TRIGGER calculate_day_number_trigger
  BEFORE INSERT OR UPDATE ON public.trade_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_day_number();

-- Update existing submissions to have day_number
UPDATE public.trade_submissions 
SET day_number = (submission_date - '2025-07-24'::date + 1)
WHERE day_number IS NULL 
AND (submission_date - '2025-07-24'::date + 1) BETWEEN 1 AND 15;

-- Add RLS policy for admin access
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all submissions" ON public.trade_submissions
FOR ALL USING (public.is_admin());