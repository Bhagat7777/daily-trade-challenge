-- Create propfirm_campaigns table
CREATE TABLE public.propfirm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prop_firm_name TEXT NOT NULL,
  logo_url TEXT,
  banner_image_url TEXT,
  cta_text TEXT DEFAULT 'Get Started',
  cta_link TEXT NOT NULL,
  coupon_code TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  display_locations TEXT[] DEFAULT ARRAY['dashboard'],
  campaign_type TEXT DEFAULT 'banner',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create clicks tracking table
CREATE TABLE public.propfirm_campaign_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.propfirm_campaigns(id) ON DELETE CASCADE,
  user_id UUID,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  click_type TEXT DEFAULT 'cta_button'
);

-- Enable RLS
ALTER TABLE public.propfirm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propfirm_campaign_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for propfirm_campaigns
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

-- RLS Policies for propfirm_campaign_clicks
CREATE POLICY "Anyone can insert clicks"
  ON public.propfirm_campaign_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view clicks"
  ON public.propfirm_campaign_clicks FOR SELECT
  USING (is_admin());

-- Create function to get active campaigns by location
CREATE OR REPLACE FUNCTION public.get_active_propfirm_campaigns(p_location TEXT DEFAULT 'dashboard')
RETURNS SETOF public.propfirm_campaigns
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.propfirm_campaigns
  WHERE is_enabled = true
    AND start_time <= now()
    AND end_time >= now()
    AND p_location = ANY(display_locations)
  ORDER BY priority DESC, created_at DESC;
$$;

-- Create updated_at trigger
CREATE TRIGGER update_propfirm_campaigns_updated_at
  BEFORE UPDATE ON public.propfirm_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();