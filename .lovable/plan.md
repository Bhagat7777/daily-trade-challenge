

## Plan: Add Campaign Selector to Admin Dashboard

### Problem
When a campaign ends, `useAdminDashboard` only queries `status = 'live'` and `is_active = true`, so all leaderboard/scorecard/submission data disappears from the admin panel.

### Solution
Add a campaign selector dropdown at the top of the admin dashboard. Fetch all campaigns (not just live ones) and let the admin switch between them. Default to the most recent campaign.

### Changes

**1. `src/hooks/useAdminDashboard.ts`**
- Add `allCampaigns` state and `fetchAllCampaigns()` that fetches all campaigns ordered by `start_date DESC` (no status filter)
- Add `selectedCampaignId` / `setSelectedCampaignId` state
- Change `fetchActiveCampaign` to use `selectedCampaignId` -- find the campaign from `allCampaigns` instead of querying only live ones
- Update `fetchUsers` to work with any selected campaign (live or ended)
- Auto-select the most recent campaign (prefer live, fallback to latest ended)
- Expose `allCampaigns`, `selectedCampaignId`, `setSelectedCampaignId` from the hook

**2. `src/hooks/useCampaignSubmissions.ts`**
- Accept an optional `campaignId` parameter
- When provided, fetch that campaign's data regardless of status (remove the `status = 'live'` filter)
- Fall back to current behavior (fetch live campaign) when no ID provided

**3. `src/pages/AdminDashboard.tsx`**
- Add a `Select` dropdown in the header area showing all campaigns with status badges (Live / Ended / Upcoming)
- Pass `selectedCampaignId` to `AdminScorecardLeaderboard`, `CampaignSubmissions`, and `PendingVerifications`
- Pass the selected campaign object to `AdminLeaderboard`

**4. `src/components/admin/CampaignSubmissions.tsx`**
- Accept optional `campaignId` prop and pass it to `useCampaignSubmissions`

**5. `src/components/admin/PendingVerifications.tsx`**
- Accept optional `campaignId` prop and filter submissions by that campaign

### No database changes needed
All data is already stored with `campaign_id` foreign keys. This is purely a frontend filtering change.

