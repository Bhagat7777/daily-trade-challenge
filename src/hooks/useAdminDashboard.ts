import { useState, useEffect } from 'react';
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
  const { toast } = useToast();
  const { user } = useAuth();

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
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Join profiles with challenge_participants
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
            completion_rate
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get last submission date for each user
      const usersWithSubmissions = await Promise.all(
        (data || []).map(async (user) => {
          const { data: lastSubmission } = await supabase
            .from('trade_submissions')
            .select('submission_date')
            .eq('user_id', user.id)
            .order('submission_date', { ascending: false })
            .limit(1)
            .single();

          const participant = user.challenge_participants?.[0];
          
          return {
            id: user.id,
            username: user.username || 'Anonymous',
            full_name: user.full_name || 'Anonymous User',
            email: 'Email hidden for privacy', // We can't access auth.users from client
            total_submissions: participant?.total_submissions || 0,
            current_streak: participant?.current_streak || 0,
            last_submission_date: lastSubmission?.submission_date || null,
            is_challenge_completed: user.is_challenge_completed || false,
            is_disqualified: user.is_disqualified || false,
            admin_notes: user.admin_notes,
            challenge_start_date: participant?.challenge_start_date || '2025-07-24',
            completion_rate: participant?.completion_rate || 0,
          };
        })
      );

      setUsers(usersWithSubmissions);
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
  };

  // Fetch submissions for a specific user
  const fetchUserSubmissions = async (userId: string) => {
    try {
      setSubmissionsLoading(true);
      
      const { data, error } = await supabase
        .from('trade_submissions')
        .select('*')
        .eq('user_id', userId)
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
        fetchUsers();
      }
    });

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_submissions'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    users,
    submissions,
    loading,
    submissionsLoading,
    fetchUserSubmissions,
    updateUserStatus,
    updateSubmissionRule,
    exportToCSV,
    checkAdminStatus,
    refreshData: fetchUsers,
  };
};