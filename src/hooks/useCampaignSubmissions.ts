import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define types for clarity
export interface Campaign {
  id: string;
  title: string;
  days_count: number;
  start_date: string;
}

export interface Submission {
  id: string;
  user_id: string;
  day_number: number;
  twitter_link: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
}

export interface TraderData {
  profile: Profile;
  submissions: Map<number, Submission>; // Map day_number to submission
  totalSubmissions: number;
}

export const useCampaignSubmissions = () => {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [traders, setTraders] = useState<Map<string, TraderData>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const processSubmissions = (profiles: Profile[], submissions: Submission[]): Map<string, TraderData> => {
    const tradersMap = new Map<string, TraderData>();

    // Initialize map with all profiles that have submissions
    profiles.forEach(profile => {
      tradersMap.set(profile.id, {
        profile,
        submissions: new Map(),
        totalSubmissions: 0,
      });
    });

    // Populate submissions
    submissions.forEach(submission => {
      const trader = tradersMap.get(submission.user_id);
      if (trader && submission.day_number) {
        trader.submissions.set(submission.day_number, submission);
      }
    });
    
    // Calculate total submissions
    tradersMap.forEach(trader => {
      trader.totalSubmissions = trader.submissions.size;
    });

    return tradersMap;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch active campaign (more robust query)
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, title, days_count, start_date')
        .eq('status', 'live')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (campaignError || !campaignData) {
        setActiveCampaign(null);
        setTraders(new Map());
        if (campaignError && campaignError.code !== 'PGRST116') throw campaignError; // Ignore "no rows found"
        return;
      }
      setActiveCampaign(campaignData);

      // 2. Fetch all submissions for the active campaign
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('trade_submissions')
        .select('id, user_id, day_number, twitter_link, created_at')
        .eq('campaign_id', campaignData.id);

      if (submissionsError) throw submissionsError;

      // 3. Get unique user IDs and fetch their profiles
      const userIds = [...new Set(submissionsData.map(s => s.user_id))];
      if (userIds.length === 0) {
        setTraders(new Map());
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // 4. Process and set the data
      const processedData = processSubmissions(profilesData, submissionsData);
      setTraders(processedData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch campaign submission data.",
        variant: "destructive",
      });
      console.error("Error fetching campaign submissions:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();

    // Set up Supabase Realtime subscription
    const channel = supabase
      .channel('campaign-submissions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_submissions',
        },
        (payload) => {
          console.log('Realtime update received for submissions:', payload);
          // Refetch all data on any change to ensure consistency
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { activeCampaign, traders, loading };
};