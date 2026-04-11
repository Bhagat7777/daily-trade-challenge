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
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all campaigns
  const fetchAllCampaigns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setAllCampaigns(data || []);

      // Auto-select: prefer live campaign, fallback to most recent
      if (!selectedCampaignId && data && data.length > 0) {
        const liveCampaign = data.find(c => c.status === 'live' && c.is_active);
        const defaultCampaign = liveCampaign || data[0];
        setSelectedCampaignId(defaultCampaign.id);
        setActiveCampaign(defaultCampaign);
        return defaultCampaign;
      }

      // If selectedCampaignId is set, find it
      if (selectedCampaignId && data) {
        const found = data.find(c => c.id === selectedCampaignId);
        if (found) {
          setActiveCampaign(found);
          return found;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return null;
    }
  }, [selectedCampaignId]);

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
    setLoading(true);
    try {
      const campaign = await fetchAllCampaigns();
      if (!campaign) {
        setUsers([]);
        return;
      }

      const { data: participants, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            is_challenge_completed,
            is_disqualified,
            admin_notes
          )
        `)
        .eq('campaign_id', campaign.id);

      if (error) throw error;

      const enrichedUsers = await Promise.all(
        (participants || []).map(async (p) => {
          const profile = p.profiles;
          if (!profile) return null;

          const { count: liveSubmissionCount } = await supabase
            .from('trade_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .eq('campaign_id', campaign.id);

          const { data: lastSub } = await supabase
            .from('trade_submissions')
            .select('submission_date')
            .eq('user_id', profile.id)
            .eq('campaign_id', campaign.id)
            .order('submission_date', { ascending: false })
            .limit(1)
            .single();

          return {
            id: profile.id,
            username: profile.username || 'Anonymous',
            full_name: profile.full_name || 'Anonymous User',
            email: 'Email hidden for privacy',
            total_submissions: liveSubmissionCount || 0,
            current_streak: p.current_streak || 0,
            last_submission_date: lastSub?.submission_date || null,
            is_challenge_completed: profile.is_challenge_completed || false,
            is_disqualified: profile.is_disqualified || false,
            admin_notes: profile.admin_notes,
            challenge_start_date: p.challenge_start_date || campaign.start_date,
            completion_rate: campaign.days_count
              ? Math.round(((liveSubmissionCount || 0) / campaign.days_count) * 100)
              : 0,
          };
        })
      );

      const finalUsers = enrichedUsers.filter((u): u is AdminUser => u !== null && u.total_submissions > 0);

      setUsers(finalUsers);
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
  }, [fetchAllCampaigns, toast]);

  // Fetch submissions for a specific user
  const fetchUserSubmissions = async (userId: string) => {
    try {
      setSubmissionsLoading(true);
      
      const campaign = activeCampaign || await fetchAllCampaigns();
      
      if (!campaign) {
        setSubmissions([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('trade_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('campaign_id', campaign.id)
        .order('submission_date', { ascending: true });

      if (error) throw error;

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
        fetchUsers();
      }
    });

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
        debouncedFetchUsers
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_submissions'
        },
        debouncedFetchUsers
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants'
        },
        debouncedFetchUsers
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns'
        },
        () => {
          debouncedFetchUsers();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(updateTimeout);
      supabase.removeChannel(channel);
    };
  }, [user, fetchUsers]);

  // When selectedCampaignId changes, refetch
  useEffect(() => {
    if (selectedCampaignId) {
      fetchUsers();
    }
  }, [selectedCampaignId]);

  return {
    users,
    submissions,
    loading,
    submissionsLoading,
    activeCampaign,
    allCampaigns,
    selectedCampaignId,
    setSelectedCampaignId,
    lastUpdate,
    fetchUserSubmissions,
    updateUserStatus,
    updateSubmissionRule,
    exportToCSV,
    checkAdminStatus,
    refreshData: fetchUsers,
  };
};