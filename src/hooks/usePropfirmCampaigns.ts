import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PropfirmCampaign {
  id: string;
  title: string;
  description: string | null;
  prop_firm_name: string;
  logo_url: string | null;
  banner_image_url: string | null;
  cta_text: string;
  cta_link: string;
  coupon_code: string | null;
  start_time: string;
  end_time: string;
  priority: number;
  is_enabled: boolean;
  display_locations: string[];
  campaign_type: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const DISMISSED_CAMPAIGNS_KEY = 'dismissed_propfirm_campaigns';

export const usePropfirmCampaigns = (location: 'dashboard' | 'journal' | 'landing' = 'dashboard') => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<PropfirmCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedCampaigns, setDismissedCampaigns] = useState<Set<string>>(new Set());

  // Load dismissed campaigns from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_CAMPAIGNS_KEY);
    if (dismissed) {
      try {
        const parsed = JSON.parse(dismissed);
        setDismissedCampaigns(new Set(parsed));
      } catch {
        setDismissedCampaigns(new Set());
      }
    }
  }, []);

  // Fetch active campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_active_propfirm_campaigns', { p_location: location });

      if (error) {
        console.error('Error fetching propfirm campaigns:', error);
        return;
      }

      setCampaigns((data as PropfirmCampaign[]) || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchCampaigns();

    // Set up interval to refresh campaigns (check for expired ones)
    const interval = setInterval(fetchCampaigns, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  // Dismiss a campaign
  const dismissCampaign = useCallback((campaignId: string) => {
    const newDismissed = new Set(dismissedCampaigns);
    newDismissed.add(campaignId);
    setDismissedCampaigns(newDismissed);
    localStorage.setItem(DISMISSED_CAMPAIGNS_KEY, JSON.stringify([...newDismissed]));
    
    // Track dismiss click
    trackClick(campaignId, 'dismiss');
  }, [dismissedCampaigns]);

  // Track click events
  const trackClick = useCallback(async (campaignId: string, clickType: 'cta_button' | 'banner_click' | 'copy_coupon' | 'dismiss') => {
    try {
      await supabase
        .from('propfirm_campaign_clicks')
        .insert({
          campaign_id: campaignId,
          user_id: user?.id || null,
          click_type: clickType,
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }, [user?.id]);

  // Get visible campaigns (not dismissed)
  const visibleCampaigns = campaigns.filter(c => !dismissedCampaigns.has(c.id));

  // Get the highest priority campaign for display
  const topCampaign = visibleCampaigns.length > 0 ? visibleCampaigns[0] : null;

  return {
    campaigns: visibleCampaigns,
    topCampaign,
    loading,
    dismissCampaign,
    trackClick,
    refetch: fetchCampaigns,
  };
};
