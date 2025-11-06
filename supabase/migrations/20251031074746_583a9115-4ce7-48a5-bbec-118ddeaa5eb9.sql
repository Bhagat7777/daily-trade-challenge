-- Create storage bucket for campaign banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-banners',
  'campaign-banners',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaign banners
CREATE POLICY "Anyone can view campaign banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-banners');

CREATE POLICY "Admins can upload campaign banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-banners' 
  AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can update campaign banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'campaign-banners'
  AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can delete campaign banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campaign-banners'
  AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);