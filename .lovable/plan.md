
# PropFirm Campaign & Marketing Feature - Implementation Plan

## Overview

Build a promotional campaign system that allows admins to run time-based marketing campaigns for prop firms during trading contests. The system will display subtle, professional promotional banners and cards without affecting the core trading journal functionality.

---

## Architecture Diagram

```text
+------------------+     +----------------------+     +------------------+
|   Admin Panel    |     |   Supabase Backend   |     |   User Frontend  |
+------------------+     +----------------------+     +------------------+
|                  |     |                      |     |                  |
| Campaign CRUD    +---->| propfirm_campaigns   +---->| Top Banner       |
| Enable/Disable   |     | campaign_clicks      |     | Promo Card       |
| Set Priority     |     | RLS Policies         |     | Buy Now Button   |
| Track Clicks     |     |                      |     | Dismiss Option   |
|                  |     +----------------------+     |                  |
+------------------+                                  +------------------+
```

---

## Step 1: Database Schema Design

### New Table: `propfirm_campaigns`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Campaign title |
| description | text | Short description |
| prop_firm_name | text | Name of the prop firm |
| logo_url | text | Prop firm logo URL |
| banner_image_url | text | Banner image (for dashboard) |
| cta_text | text | Call-to-action button text |
| cta_link | text | Affiliate/promo link |
| coupon_code | text | Optional discount code |
| start_time | timestamptz | Campaign start (with time) |
| end_time | timestamptz | Campaign end (with time) |
| priority | integer | Display order (higher = shown first) |
| is_enabled | boolean | Manual enable/disable toggle |
| display_locations | text[] | Where to show: 'dashboard', 'journal', 'landing' |
| campaign_type | text | 'banner', 'card', 'popup' |
| created_by | uuid | Admin who created it |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### New Table: `propfirm_campaign_clicks`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| campaign_id | uuid | FK to propfirm_campaigns |
| user_id | uuid | Optional - logged in user |
| clicked_at | timestamptz | When clicked |
| click_type | text | 'cta_button', 'banner', 'copy_coupon' |

---

## Step 2: Backend Implementation

### Database Migration

```sql
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

-- RLS Policies
CREATE POLICY "Anyone can view active campaigns"
  ON public.propfirm_campaigns FOR SELECT
  USING (is_enabled = true AND start_time <= now() AND end_time >= now());

CREATE POLICY "Admins can manage campaigns"
  ON public.propfirm_campaigns FOR ALL
  USING (is_admin());

CREATE POLICY "Anyone can insert clicks"
  ON public.propfirm_campaign_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view clicks"
  ON public.propfirm_campaign_clicks FOR SELECT
  USING (is_admin());

-- Create function to get active campaigns
CREATE OR REPLACE FUNCTION get_active_propfirm_campaigns(p_location TEXT DEFAULT 'dashboard')
RETURNS SETOF public.propfirm_campaigns
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT * FROM public.propfirm_campaigns
  WHERE is_enabled = true
    AND start_time <= now()
    AND end_time >= now()
    AND p_location = ANY(display_locations)
  ORDER BY priority DESC, created_at DESC;
$$;
```

---

## Step 3: React Hooks Implementation

### New Hook: `usePropfirmCampaigns.ts`

- Fetch active campaigns filtered by location
- Track click events
- Handle dismiss functionality using localStorage
- Auto-refresh on campaign time boundaries

### New Hook: `usePropfirmCampaignAdmin.ts`

- CRUD operations for admin
- Fetch all campaigns (active, scheduled, ended)
- Get click analytics per campaign
- Upload banner images to storage

---

## Step 4: Frontend Components

### Component Structure

```text
src/components/propfirm-campaigns/
  ├── PropfirmBanner.tsx         # Top banner for dashboard
  ├── PropfirmPromoCard.tsx      # Card for journal/sidebar
  ├── PropfirmCampaignAdmin.tsx  # Admin management panel
  ├── PropfirmCampaignForm.tsx   # Create/edit form
  └── PropfirmCampaignStats.tsx  # Click analytics view
```

### A. PropfirmBanner Component

- Sleek, dismissible top banner
- Shows prop firm logo, message, coupon code, and CTA
- Uses gradient matching fintech design
- "X" button to dismiss (stored in localStorage)
- Opens link in new tab

### B. PropfirmPromoCard Component

- Compact card format for sidebar/journal page
- Professional fintech styling with subtle borders
- Copy coupon button with toast notification
- "Buy Now" button opens affiliate link

### C. Admin Management Components

- Campaign list with status indicators (Scheduled/Live/Ended)
- Enable/disable toggle per campaign
- Click count display per campaign
- Form for creating new campaigns with:
  - Date/time pickers for precise scheduling
  - Image upload for banners
  - Multi-select for display locations
  - Priority selector

---

## Step 5: Integration Points

### Dashboard.tsx
- Add `PropfirmBanner` at top of page
- Subtle, non-intrusive placement above stats cards

### SubmitTrade.tsx (Journal Page)
- Add `PropfirmPromoCard` in sidebar or below form
- Only shown during active campaigns

### AdminDashboard.tsx
- New tab "Prop Firm Promos" in admin tabs
- Links to PropfirmCampaignAdmin component

---

## Step 6: UI/UX Design Specifications

### Color Scheme (Fintech Professional)
- Background: Dark gradient matching app theme
- Accent: Primary green (#22c55e)
- Border: Subtle muted border
- Text: High contrast white/gray

### Banner Design
```text
+--------------------------------------------------------------------+
| [Logo]  🎉 Special Offer from FTMO! Use code TRADE20 for 20% off   |
|                                               [Get 20% Off] [X]     |
+--------------------------------------------------------------------+
```

### Promo Card Design
```text
+------------------------+
| [Prop Firm Logo]       |
| FTMO Challenge         |
| Get 20% off with code  |
| TRADE20                |
| [Copy Code] [Buy Now]  |
+------------------------+
```

---

## Step 7: Analytics & Tracking

### Click Types Tracked
1. `cta_button` - Main call-to-action click
2. `banner_click` - Any click on banner area
3. `copy_coupon` - Copied coupon code
4. `dismiss` - User dismissed the campaign

### Admin Analytics View
- Total clicks per campaign
- Click-through rate (impressions vs clicks)
- Breakdown by click type
- Export to CSV functionality

---

## Step 8: Safety & Performance

### Guardrails
- Campaigns auto-hide when time expires (client + server check)
- Dismissed campaigns stay hidden for session (localStorage)
- Max 1 banner + 1 card shown at a time
- Lazy load banner images
- No interference with form submissions or navigation

### Caching Strategy
- Cache active campaigns for 5 minutes
- Invalidate on time boundary cross
- Real-time subscription for admin updates

---

## Technical Implementation Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/usePropfirmCampaigns.ts` | User-facing hook for active campaigns |
| `src/hooks/usePropfirmCampaignAdmin.ts` | Admin hook for CRUD + analytics |
| `src/components/propfirm-campaigns/PropfirmBanner.tsx` | Top banner component |
| `src/components/propfirm-campaigns/PropfirmPromoCard.tsx` | Promo card component |
| `src/components/propfirm-campaigns/PropfirmCampaignAdmin.tsx` | Admin management tab |
| `src/components/propfirm-campaigns/PropfirmCampaignForm.tsx` | Campaign create/edit form |
| `src/components/propfirm-campaigns/PropfirmCampaignStats.tsx` | Analytics dashboard |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add PropfirmBanner at top |
| `src/pages/SubmitTrade.tsx` | Add PropfirmPromoCard |
| `src/pages/AdminDashboard.tsx` | Add new "Promos" tab |

---

## Scalability Features

1. **Multiple Campaigns**: Priority system handles multiple active campaigns
2. **Flexible Scheduling**: Precise datetime control with timezone support
3. **Location Targeting**: Show different campaigns on different pages
4. **Campaign Types**: Support for banners, cards, and future popup formats
5. **A/B Testing Ready**: Multiple campaigns at same location with priority
6. **Contest Integration**: Can tie campaigns to specific trading challenges

This system is designed to be non-intrusive, professionally styled, and easily extensible for future marketing needs during your trading challenges.
