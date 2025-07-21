-- Clean up unused data - delete orphaned profiles and participants
DELETE FROM profiles WHERE id = '5137ca99-3b3f-457c-b612-7b5050f64259';

-- Clean up any other unused tables (reviews, blog_posts, prop_firms, website_sections, site_settings)
DELETE FROM reviews;
DELETE FROM blog_posts;
DELETE FROM prop_firms;
DELETE FROM website_sections;
DELETE FROM site_settings;