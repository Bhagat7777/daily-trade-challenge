import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export interface CampaignStats {
  campaign_id: string;
  total_clicks: number;
  cta_clicks: number;
  banner_clicks: number;
  coupon_copies: number;
  dismiss_count: number;
}

export interface CreateCampaignData {
  title: string;
  description?: string;
  prop_firm_name: string;
  logo_url?: string;
  banner_image_url?: string;
  cta_text?: string;
  cta_link: string;
  coupon_code?: string;
  start_time: string;
  end_time: string;
  priority?: number;
  is_enabled?: boolean;
  display_locations?: string[];
  campaign_type?: string;
}

export const usePropfirmCampaignAdmin = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<PropfirmCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Map<string, CampaignStats>>(new Map());

  // Fetch all campaigns (for admin)
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('propfirm_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns((data as PropfirmCampaign[]) || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch click stats for all campaigns
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('propfirm_campaign_clicks')
        .select('campaign_id, click_type');

      if (error) throw error;

      const statsMap = new Map<string, CampaignStats>();

      (data || []).forEach((click) => {
        const existing = statsMap.get(click.campaign_id) || {
          campaign_id: click.campaign_id,
          total_clicks: 0,
          cta_clicks: 0,
          banner_clicks: 0,
          coupon_copies: 0,
          dismiss_count: 0,
        };

        existing.total_clicks++;
        
        switch (click.click_type) {
          case 'cta_button':
            existing.cta_clicks++;
            break;
          case 'banner_click':
            existing.banner_clicks++;
            break;
          case 'copy_coupon':
            existing.coupon_copies++;
            break;
          case 'dismiss':
            existing.dismiss_count++;
            break;
        }

        statsMap.set(click.campaign_id, existing);
      });

      setStats(statsMap);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [fetchCampaigns, fetchStats]);

  // Create campaign
  const createCampaign = async (data: CreateCampaignData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('propfirm_campaigns')
        .insert({
          ...data,
          display_locations: data.display_locations || ['dashboard'],
          campaign_type: data.campaign_type || 'banner',
        });

      if (error) throw error;

      toast({
        title: 'Campaign Created',
        description: 'PropFirm campaign has been created successfully',
      });

      await fetchCampaigns();
      return true;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update campaign
  const updateCampaign = async (id: string, data: Partial<CreateCampaignData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('propfirm_campaigns')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Campaign Updated',
        description: 'PropFirm campaign has been updated successfully',
      });

      await fetchCampaigns();
      return true;
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to update campaign',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Toggle campaign enabled status
  const toggleEnabled = async (id: string, isEnabled: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('propfirm_campaigns')
        .update({ is_enabled: isEnabled })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isEnabled ? 'Campaign Enabled' : 'Campaign Disabled',
        description: `Campaign has been ${isEnabled ? 'enabled' : 'disabled'}`,
      });

      await fetchCampaigns();
      return true;
    } catch (error) {
      console.error('Error toggling campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle campaign status',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete campaign
  const deleteCampaign = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('propfirm_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Campaign Deleted',
        description: 'PropFirm campaign has been deleted',
      });

      await fetchCampaigns();
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get campaign status
  const getCampaignStatus = (campaign: PropfirmCampaign): 'scheduled' | 'live' | 'ended' => {
    const now = new Date();
    const startTime = new Date(campaign.start_time);
    const endTime = new Date(campaign.end_time);

    if (now < startTime) return 'scheduled';
    if (now > endTime) return 'ended';
    return 'live';
  };

  // Export stats to CSV
  const exportStatsToCSV = () => {
    const headers = ['Campaign', 'Prop Firm', 'Status', 'Total Clicks', 'CTA Clicks', 'Coupon Copies', 'Dismisses'];
    const rows = campaigns.map(c => {
      const campaignStats = stats.get(c.id) || {
        total_clicks: 0,
        cta_clicks: 0,
        coupon_copies: 0,
        dismiss_count: 0,
      };
      return [
        c.title,
        c.prop_firm_name,
        getCampaignStatus(c),
        campaignStats.total_clicks,
        campaignStats.cta_clicks,
        campaignStats.coupon_copies,
        campaignStats.dismiss_count,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propfirm-campaign-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    campaigns,
    stats,
    loading,
    createCampaign,
    updateCampaign,
    toggleEnabled,
    deleteCampaign,
    getCampaignStatus,
    exportStatsToCSV,
    refetch: fetchCampaigns,
  };
};
