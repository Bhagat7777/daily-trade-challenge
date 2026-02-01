-- Drop existing policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.propfirm_campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.propfirm_campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.propfirm_campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON public.propfirm_campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.propfirm_campaigns;

-- Create PERMISSIVE policies (default behavior)
CREATE POLICY "Anyone can view active campaigns"
  ON public.propfirm_campaigns FOR SELECT
  USING (is_enabled = true AND start_time <= now() AND end_time >= now());

CREATE POLICY "Admins can view all campaigns"
  ON public.propfirm_campaigns FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert campaigns"
  ON public.propfirm_campaigns FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update campaigns"
  ON public.propfirm_campaigns FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete campaigns"
  ON public.propfirm_campaigns FOR DELETE
  USING (is_admin());