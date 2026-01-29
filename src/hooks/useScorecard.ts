import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Scorecard {
  id: string;
  user_id: string;
  campaign_id: string;
  consistency_score: number;
  rule_score: number;
  discipline_score: number;
  total_score: number;
  completed_days: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  full_name: string;
  consistency_score: number;
  rule_score: number;
  discipline_score: number;
  total_score: number;
  completed_days: number;
  rank: number;
}

export interface DailySubmissionStatus {
  day: number;
  date: string;
  submitted: boolean;
  has_hashtag: boolean;
  has_tagged_account: boolean;
  has_chart: boolean;
  has_analysis: boolean;
}

export const useScorecard = (campaignId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailySubmissionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(campaignId || null);

  // Fetch active campaign if not provided
  const fetchActiveCampaign = useCallback(async () => {
    if (campaignId) {
      setActiveCampaignId(campaignId);
      return campaignId;
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('id')
      .eq('is_active', true)
      .eq('status', 'live')
      .maybeSingle();

    if (error) {
      console.error('Error fetching active campaign:', error);
      return null;
    }

    if (data) {
      setActiveCampaignId(data.id);
      return data.id;
    }

    return null;
  }, [campaignId]);

  // Fetch user's scorecard
  const fetchScorecard = useCallback(async () => {
    if (!user || !activeCampaignId) return;

    const { data, error } = await supabase
      .from('scorecards')
      .select('*')
      .eq('user_id', user.id)
      .eq('campaign_id', activeCampaignId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching scorecard:', error);
      return;
    }

    setScorecard(data);
  }, [user, activeCampaignId]);

  // Fetch leaderboard using RPC function
  const fetchLeaderboard = useCallback(async () => {
    if (!activeCampaignId) return;

    const { data, error } = await supabase
      .rpc('get_scorecard_leaderboard', { p_campaign_id: activeCampaignId });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return;
    }

    setLeaderboard(data || []);
  }, [activeCampaignId]);

  // Fetch daily submission status for user
  const fetchDailyStatus = useCallback(async () => {
    if (!user || !activeCampaignId) return;

    // Get campaign details for date range
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('start_date, days_count')
      .eq('id', activeCampaignId)
      .single();

    if (!campaign) return;

    // Get user's submissions for this campaign
    const { data: submissions, error } = await supabase
      .from('trade_submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('campaign_id', activeCampaignId)
      .order('submission_date', { ascending: true });

    if (error) {
      console.error('Error fetching submissions:', error);
      return;
    }

    // Build daily status array
    const startDate = new Date(campaign.start_date);
    const dailyData: DailySubmissionStatus[] = [];

    for (let i = 0; i < campaign.days_count; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      const dateString = dayDate.toISOString().split('T')[0];

      const submission = submissions?.find(s => s.submission_date === dateString);

      dailyData.push({
        day: i + 1,
        date: dateString,
        submitted: !!submission,
        has_hashtag: submission?.has_hashtag || false,
        has_tagged_account: submission?.has_tagged_account || false,
        has_chart: !!(submission?.chart_image_url),
        has_analysis: !!(submission?.trade_idea && submission.trade_idea.length > 10),
      });
    }

    setDailyStatus(dailyData);
  }, [user, activeCampaignId]);

  // Get winners (completed_days = 7, sorted by total_score)
  const getWinners = useCallback(async (limit: number = 7) => {
    if (!activeCampaignId) return [];

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('days_count')
      .eq('id', activeCampaignId)
      .single();

    if (!campaign) return [];

    const { data, error } = await supabase
      .rpc('get_scorecard_leaderboard', { p_campaign_id: activeCampaignId });

    if (error) {
      console.error('Error fetching winners:', error);
      return [];
    }

    // Filter to only completed participants
    const completedUsers = (data || []).filter(
      (entry: LeaderboardEntry) => entry.completed_days >= campaign.days_count
    );

    return completedUsers.slice(0, limit);
  }, [activeCampaignId]);

  // Handle tie-breaker: randomly select among tied users
  const selectWinnersWithTieBreaker = useCallback(async (limit: number = 7) => {
    const allWinners = await getWinners(100); // Get all eligible
    
    if (allWinners.length <= limit) return allWinners;

    // Check if there's a tie at the cutoff position
    const cutoffScore = allWinners[limit - 1]?.total_score;
    const tiedAtCutoff = allWinners.filter(w => w.total_score === cutoffScore);
    const aboveCutoff = allWinners.filter(w => w.total_score > cutoffScore);

    if (aboveCutoff.length >= limit) {
      return aboveCutoff.slice(0, limit);
    }

    // Need to randomly select from tied users
    const slotsNeeded = limit - aboveCutoff.length;
    const shuffled = [...tiedAtCutoff].sort(() => Math.random() - 0.5);
    
    return [...aboveCutoff, ...shuffled.slice(0, slotsNeeded)];
  }, [getWinners]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchActiveCampaign();
    await Promise.all([
      fetchScorecard(),
      fetchLeaderboard(),
      fetchDailyStatus(),
    ]);
    setLoading(false);
  }, [fetchActiveCampaign, fetchScorecard, fetchLeaderboard, fetchDailyStatus]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const cId = await fetchActiveCampaign();
      if (cId) {
        await Promise.all([
          fetchScorecard(),
          fetchLeaderboard(),
          fetchDailyStatus(),
        ]);
      }
      setLoading(false);
    };

    init();
  }, [user, campaignId]);

  // Re-fetch when activeCampaignId changes
  useEffect(() => {
    if (activeCampaignId) {
      Promise.all([
        fetchScorecard(),
        fetchLeaderboard(),
        fetchDailyStatus(),
      ]);
    }
  }, [activeCampaignId, fetchScorecard, fetchLeaderboard, fetchDailyStatus]);

  // Real-time subscription for scorecard updates
  useEffect(() => {
    if (!user || !activeCampaignId) return;

    const channel = supabase
      .channel('scorecard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scorecards',
        },
        () => {
          fetchScorecard();
          fetchLeaderboard();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_submissions',
        },
        () => {
          fetchDailyStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeCampaignId, fetchScorecard, fetchLeaderboard, fetchDailyStatus]);

  return {
    scorecard,
    leaderboard,
    dailyStatus,
    loading,
    activeCampaignId,
    refreshData,
    getWinners,
    selectWinnersWithTieBreaker,
  };
};
