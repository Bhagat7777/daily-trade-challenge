import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  is_active: boolean;
  status: 'upcoming' | 'live' | 'ended' | 'archived';
  banner_url: string | null;
  rules: string | null;
  rewards: any;
  slug: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CampaignStats {
  total: number;
  active: number;
  upcoming: number;
  ended: number;
}

export const useCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CampaignStats>({
    total: 0,
    active: 0,
    upcoming: 0,
    ended: 0,
  });
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      // Update campaign statuses first
      const { error: updateError } = await supabase.rpc('update_campaign_status');
      if (updateError) console.error('Error updating campaign status:', updateError);

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      setCampaigns((data || []) as Campaign[]);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(c => c.status === 'live').length || 0;
      const upcoming = data?.filter(c => c.status === 'upcoming').length || 0;
      const ended = data?.filter(c => c.status === 'ended').length || 0;
      
      setStats({ total, active, upcoming, ended });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });

      await fetchCampaigns();
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCampaign = async (id: string, campaignData: Partial<Campaign>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update(campaignData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });

      await fetchCampaigns();
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });

      await fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadBanner = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-banners')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicateCampaign = async (campaign: Campaign) => {
    try {
      const newCampaign: Partial<Campaign> = {
        title: `${campaign.title} (Copy)`,
        description: campaign.description,
        type: campaign.type,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        days_count: campaign.days_count,
        banner_url: campaign.banner_url,
        rules: campaign.rules,
        rewards: campaign.rewards,
        status: 'upcoming' as const,
      };

      return await createCampaign(newCampaign);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchCampaigns();

    // Set up real-time subscription
    const channel = supabase
      .channel('campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
        fetchCampaigns();
      })
      .subscribe();

    // Auto-update campaign status every minute
    const interval = setInterval(async () => {
      await supabase.rpc('update_campaign_status');
      fetchCampaigns();
    }, 60000); // 1 minute

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    campaigns,
    loading,
    stats,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    uploadBanner,
    duplicateCampaign,
    refetch: fetchCampaigns,
  };
};
