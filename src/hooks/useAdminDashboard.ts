import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
  total_submissions: number;
  current_streak: number;
  last_submission_date: string | null;
  is_challenge_completed: boolean;
  is_disqualified: boolean;
  admin_notes: string | null;
  challenge_start_date: string;
  completion_rate: number;
}

interface UserSubmission {
  id: string;
  submission_date: string;
  day_number: number | null;
  trade_idea: string;
  chart_image_url: string | null;
  twitter_link: string;
  market_pair: string | null;
  rule_followed: boolean;
  created_at: string;
}

export const useAdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch active campaign
  const fetchActiveCampaign = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setActiveCampaign(data);
      return data;
    } catch (error) {
      console.error('Error fetching active campaign:', error);
      return null;
    }
  }, []);

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return profile?.role === 'admin';
  };

  // Fetch all users with their challenge data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const campaign = await fetchActiveCampaign();
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          is_challenge_completed,
          is_disqualified,
          admin_notes,
          challenge_participants (
            total_submissions,
            current_streak,
            challenge_start_date,
            completion_rate,
            campaign_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithSubmissions = await Promise.all(
        (data || []).map(async (user) => {
          let campaignSubmissions = 0;
          let lastSubmissionDate = null;
          let completionRate = 0;
          let participant = null;
          let currentStreak = 0;
          let challengeStartDate = '2025-11-06';
          let campaignDays = 15;

          if (campaign?.id) {
            campaignDays = campaign.days_count;

            const { count } = await supabase
              .from('trade_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('campaign_id', campaign.id);
            campaignSubmissions = count || 0;

            if (campaignSubmissions > 0) {
              const { data: lastSub } = await supabase
                .from('trade_submissions')
                .select('submission_date')
                .eq('user_id', user.id)
                .eq('campaign_id', campaign.id)
                .order('submission_date', { ascending: false })
                .limit(1)
                .single();
              lastSubmissionDate = lastSub?.submission_date || null;
            }

            const participants = user.challenge_participants;
            const participantsArray = Array.isArray(participants) ? participants : (participants ? [participants] : []);
            participant = participantsArray.find((p: any) => p.campaign_id === campaign.id);
            
            if (participant) {
              currentStreak = participant.current_streak || 0;
              challengeStartDate = participant.challenge_start_date || campaign.start_date;
            } else {
              challengeStartDate = campaign.start_date;
            }

            completionRate = campaign.days_count 
              ? Math.round((campaignSubmissions / campaign.days_count) * 100) 
              : 0;
          }

          return {
            id: user.id,
            username: user.username || 'Anonymous',
            full_name: user.full_name || 'Anonymous User',
            email: 'Email hidden for privacy',
            total_submissions: campaignSubmissions,
            current_streak: currentStreak,
            last_submission_date: lastSubmissionDate,
            is_challenge_completed: user.is_challenge_completed || false,
            is_disqualified: user.is_disqualified || false,
            admin_notes: user.admin_notes,
            challenge_start_date: challengeStartDate,
            completion_rate: completionRate,
            campaign_days: campaignDays,
          };
        })
      );

      const filtered = campaign?.id 
        ? usersWithSubmissions.filter(u => u.total_submissions > 0) 
        : usersWithSubmissions;

      setUsers(filtered);
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchActiveCampaign, toast]);

  // Fetch submissions for a specific user
  const fetchUserSubmissions = async (userId: string) => {
    try {
      setSubmissionsLoading(true);
      
      // Get the active campaign first
      const campaign = activeCampaign || await fetchActiveCampaign();
      
      if (!campaign) {
        console.log('No active campaign found');
        setSubmissions([]);
        return;
      }
      
      // Fetch submissions for this user - ONLY from active campaign
      const { data, error } = await supabase
        .from('trade_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('campaign_id', campaign.id)
        .order('submission_date', { ascending: true });

      if (error) throw error;

      console.log('Fetched submissions for user:', userId, 'Campaign:', campaign.id, 'Count:', data?.length);
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user submissions",
        variant: "destructive",
      });
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Update user status (completed/disqualified)
  const updateUserStatus = async (
    userId: string, 
    updates: Partial<Pick<AdminUser, 'is_challenge_completed' | 'is_disqualified' | 'admin_notes'>>
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Refresh users data
      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  // Update submission rule compliance
  const updateSubmissionRule = async (submissionId: string, ruleFollowed: boolean) => {
    try {
      const { error } = await supabase
        .from('trade_submissions')
        .update({ rule_followed: ruleFollowed })
        .eq('id', submissionId);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, rule_followed: ruleFollowed }
            : sub
        )
      );

      toast({
        title: "Success",
        description: "Rule compliance updated",
      });
    } catch (error: any) {
      console.error('Error updating submission rule:', error);
      toast({
        title: "Error",
        description: "Failed to update rule compliance",
        variant: "destructive",
      });
    }
  };

  // Export data to CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    checkAdminStatus().then(isAdmin => {
      if (isAdmin) {
        fetchActiveCampaign();
        fetchUsers();
      }
    });

    // Subscribe to real-time updates with debouncing
    let updateTimeout: NodeJS.Timeout;
    const debouncedFetchUsers = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        fetchUsers();
      }, 500);
    };

    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profile updated - refreshing leaderboard');
          debouncedFetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_submissions'
        },
        (payload) => {
          console.log('Submission updated:', payload);
          debouncedFetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants'
        },
        () => {
          console.log('Participant stats updated');
          debouncedFetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns'
        },
        () => {
          console.log('Campaign updated');
          fetchActiveCampaign();
          debouncedFetchUsers();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(updateTimeout);
      supabase.removeChannel(channel);
    };
  }, [user, fetchUsers, fetchActiveCampaign]);

  return {
    users,
    submissions,
    loading,
    submissionsLoading,
    activeCampaign,
    lastUpdate,
    fetchUserSubmissions,
    updateUserStatus,
    updateSubmissionRule,
    exportToCSV,
    checkAdminStatus,
    refreshData: fetchUsers,
  };
};