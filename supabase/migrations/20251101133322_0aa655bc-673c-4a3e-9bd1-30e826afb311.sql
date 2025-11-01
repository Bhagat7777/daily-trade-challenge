-- Fix storage policies for campaign banners (they were using wrong admin check)
DROP POLICY IF EXISTS "Admins can upload campaign banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update campaign banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete campaign banners" ON storage.objects;

-- Recreate with correct admin check using role field
CREATE POLICY "Admins can upload campaign banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-banners' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update campaign banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'campaign-banners'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete campaign banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campaign-banners'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Remove unique constraint on active campaigns if it exists
DROP INDEX IF EXISTS idx_one_active_campaign;