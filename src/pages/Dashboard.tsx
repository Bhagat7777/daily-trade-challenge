import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTradingJournal } from '@/hooks/useTradingJournal';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import SocialLinks from '@/components/ui/social-links';
import { format } from 'date-fns';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Flame, 
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Lock,
  Unlock
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  days_count: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userStats, loading, canSubmitToday, submissions } = useTradingJournal();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCampaign = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true)
          .order('start_date', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching active campaign:', error);
        } else {
          setActiveCampaign(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setCampaignLoading(false);
      }
    };

    fetchActiveCampaign();

    // Set up real-time subscription for campaign changes
    const campaignChannel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
        },
        () => {
          fetchActiveCampaign();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(campaignChannel);
    };
  }, []);

  const calculatedStreak = useMemo(() => {
    if (submissions.length === 0) return 0;

    const submissionDates = new Set(submissions.map(s => s.submission_date));
    const sortedDates = [...submissionDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length === 0) return 0;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const lastSubmissionDateUTC = new Date(sortedDates[0] + 'T00:00:00Z');

    const timeDiff = today.getTime() - lastSubmissionDateUTC.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

    if (dayDiff > 1) {
      return 0;
    }

    let streak = 0;
    let currentDate = lastSubmissionDateUTC;
    while (submissionDates.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    }

    return streak;
  }, [submissions]);

  if (loading || campaignLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isCampaignLive = activeCampaign?.status === 'live';
  const campaignStartDate = activeCampaign ? new Date(activeCampaign.start_date) : null;
  const campaignEndDate = activeCampaign ? new Date(activeCampaign.end_date) : null;
  const daysCount = activeCampaign?.days_count || 15;
  
  // Generate campaign-based calendar data
  const getCampaignCalendarData = () => {
    if (!campaignStartDate) return [];
    
    const calendar = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < daysCount; i++) {
      const dayDate = new Date(campaignStartDate);
      dayDate.setDate(campaignStartDate.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);
      
      const dateString = dayDate.toISOString().split('T')[0];
      // Submissions from the hook are now pre-filtered for the active campaign
      const submission = submissions.find(sub => sub.submission_date === dateString);
      
      const isUnlocked = dayDate <= today;
      const isPast = dayDate < today;
      const isToday = dayDate.getTime() === today.getTime();
      const isFuture = dayDate > today;
      
      calendar.push({
        date: dateString,
        day: i + 1,
        dayDate: dayDate,
        hasSubmission: !!submission,
        isPast,
        isToday,
        isFuture,
        isUnlocked,
        isLocked: !isUnlocked,
      });
    }
    
    return calendar;
  };
  
  const calendarData = isCampaignLive ? getCampaignCalendarData() : [];
  
  // Calculate current day based on campaign start date and today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = campaignStartDate ? 
    Math.min(Math.max(1, Math.floor((today.getTime() - campaignStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1), daysCount) : 1;
  
  // Submissions from the hook are pre-filtered, so we can just use the length
  const campaignSubmissions = submissions.length;
  
  const progressPercentage = Math.round((campaignSubmissions / daysCount) * 100);

  return (
    <div className="pb-20 md:pb-0">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.user_metadata?.username || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Track your progress and maintain your trading journal consistency.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Day {currentDay}</div>
            <p className="text-xs text-muted-foreground">
              of {daysCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              out of {daysCount} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedStreak}</div>
            <p className="text-xs text-muted-foreground">
              consecutive days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              of challenge
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-gradient-card shadow-card mt-8">
        <CardHeader>
          <CardTitle>Challenge Progress</CardTitle>
          <CardDescription>
            {activeCampaign ? `Your journey through the ${activeCampaign.title}` : `Your journey through the ${daysCount}-day trading journal challenge`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {campaignSubmissions} / {daysCount} days completed
            </span>
            {canSubmitToday() ? (
              <Badge variant="default" className="bg-success text-success-foreground">
                Ready to submit today
              </Badge>
            ) : (
              <Badge variant="secondary">
                Today's submission complete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Progress Tracker */}
      <Card className="bg-gradient-card shadow-card mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {activeCampaign?.title || 'Campaign'} - {daysCount} Day Tracker
          </CardTitle>
          <CardDescription>
            {isCampaignLive 
              ? 'Days unlock one by one. Tap an unlocked day to submit.' 
              : activeCampaign 
                ? 'Campaign calendar will open when it starts'
                : 'No active campaign at the moment'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCampaignLive ? (
            <div className="text-center py-12 space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <CalendarDays className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {activeCampaign?.title || 'Campaign Coming Soon'}
                </h3>
                {campaignStartDate && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Campaign starts on:</p>
                    <p className="text-2xl font-bold text-primary">
                      {format(campaignStartDate, 'MMMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
              {calendarData.map((day) => {
                const isClickable = day.isUnlocked && !day.hasSubmission && day.isToday;
                
                return (
                  <div
                    key={day.day}
                    onClick={() => {
                      if (isClickable) {
                        navigate('/submit');
                      }
                    }}
                    className={`
                      relative p-2 sm:p-4 rounded-lg border-2 transition-all
                      ${day.hasSubmission 
                        ? 'border-success bg-success/10' 
                        : day.isLocked
                          ? 'border-muted bg-muted/30 opacity-60'
                          : day.isToday 
                            ? 'border-primary bg-primary/10 cursor-pointer hover:bg-primary/20' 
                            : day.isPast && !day.hasSubmission
                              ? 'border-destructive bg-destructive/10'
                              : 'border-muted bg-muted/50'
                      }
                    `}
                  >
                    <div className="text-center space-y-1 sm:space-y-2">
                      <div className="text-sm font-medium">Day {day.day}</div>
                      <div className="flex justify-center">
                        {day.isLocked ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : day.hasSubmission ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : day.isToday ? (
                          <Unlock className="h-5 w-5 text-primary" />
                        ) : day.isPast ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {format(day.dayDate, 'MMM dd')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;