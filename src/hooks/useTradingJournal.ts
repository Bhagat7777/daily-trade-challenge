import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TradeSubmission {
  id: string;
  user_id: string;
  submission_date: string;
  trade_idea: string;
  chart_image_url?: string;
  twitter_link: string;
  market_pair?: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_start_date: string;
  total_submissions: number;
  current_streak: number;
  longest_streak: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string;
  } | null;
}

export const useTradingJournal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<TradeSubmission[]>([]);
  const [userStats, setUserStats] = useState<ChallengeParticipant | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's submissions
  const fetchUserSubmissions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trade_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submission_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your submissions",
        variant: "destructive",
      });
    } else {
      setSubmissions(data || []);
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({
        title: "Error",
        description: "Failed to fetch your stats",
        variant: "destructive",
      });
    } else {
      setUserStats(data);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      // Fetch participants and profiles separately to avoid join issues
      const { data: participantsData, error: participantsError } = await supabase
        .from('challenge_participants')
        .select('*')
        .order('total_submissions', { ascending: false })
        .order('current_streak', { ascending: false })
        .limit(20);

      if (participantsError) {
        throw participantsError;
      }

      // Fetch profiles separately, excluding disqualified users
      const userIds = participantsData?.map(p => p.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, full_name, is_disqualified')
        .in('id', userIds)
        .eq('is_disqualified', false);

      // Combine the data and filter out disqualified users
      const transformedData: ChallengeParticipant[] = participantsData
        ?.map(participant => {
          const profile = profilesData?.find(p => p.id === participant.user_id);
          return {
            ...participant,
            profiles: profile ? {
              username: profile.username || 'Anonymous',
              full_name: profile.full_name || 'Anonymous User'
            } : null
          };
        })
        .filter(participant => participant.profiles !== null) || []; // Only include non-disqualified users

      setLeaderboard(transformedData);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard",
        variant: "destructive",
      });
      setLeaderboard([]);
    }
  };

  // Submit new trade idea
  const submitTradeIdea = async (
    tradeIdea: string,
    twitterLink: string,
    marketPair?: string,
    chartFile?: File
  ) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      let chartUrl = '';

      // Upload chart image if provided
      if (chartFile) {
        const fileExt = chartFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trade-charts')
          .upload(fileName, chartFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('trade-charts')
          .getPublicUrl(fileName);

        chartUrl = publicUrl;
      }

      // Insert trade submission
      const { error } = await supabase
        .from('trade_submissions')
        .insert({
          user_id: user.id,
          trade_idea: tradeIdea,
          twitter_link: twitterLink,
          market_pair: marketPair,
          chart_image_url: chartUrl,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Your trade idea has been submitted",
      });

      // Refresh data
      await Promise.all([fetchUserSubmissions(), fetchUserStats(), fetchLeaderboard()]);

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit trade idea",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Check if user can submit today
  const canSubmitToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return !submissions.some(sub => sub.submission_date === today);
  };

  // Get submission calendar data
  const getCalendarData = () => {
    const calendar = [];
    const startDate = userStats?.challenge_start_date ? 
      new Date(userStats.challenge_start_date) : 
      new Date();
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const submission = submissions.find(sub => sub.submission_date === dateString);
      const today = new Date().toISOString().split('T')[0];
      
      calendar.push({
        date: dateString,
        day: i + 1,
        hasSubmission: !!submission,
        isPast: dateString < today,
        isToday: dateString === today,
        isFuture: dateString > today,
      });
    }
    
    return calendar;
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchUserSubmissions(),
        fetchUserStats(),
        fetchLeaderboard()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const submissionsChannel = supabase
      .channel('trade-submissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_submissions',
        },
        () => {
          fetchUserSubmissions();
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
        },
        () => {
          fetchUserStats();
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [user]);

  return {
    submissions,
    userStats,
    leaderboard,
    loading,
    submitTradeIdea,
    canSubmitToday,
    getCalendarData,
    refreshData: () => {
      if (user) {
        Promise.all([
          fetchUserSubmissions(),
          fetchUserStats(),
          fetchLeaderboard()
        ]);
      }
    }
  };
};