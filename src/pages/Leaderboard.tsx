import React, { useState, useEffect } from 'react';
import { useTradingJournal } from '@/hooks/useTradingJournal';
import { useScorecard } from '@/hooks/useScorecard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import ScorecardLeaderboard from '@/components/scorecard/ScorecardLeaderboard';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users,
  Target,
  Flame,
  Calendar,
  Star
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  days_count: number;
  start_date: string;
  end_date: string;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const { leaderboard: submissionLeaderboard, loading } = useTradingJournal();
  const { leaderboard: scorecardLeaderboard, loading: scorecardLoading } = useScorecard();
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('id, title, days_count, start_date, end_date')
        .eq('is_active', true)
        .maybeSingle();
      
      if (data) setCampaign(data);
    };
    
    fetchCampaign();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">1st Place</Badge>;
      case 2:
        return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white">2nd Place</Badge>;
      case 3:
        return <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">3rd Place</Badge>;
      default:
        return <Badge variant="secondary">#{rank}</Badge>;
    }
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 10) return <Badge className="bg-gradient-success text-success-foreground">🔥 Hot Streak</Badge>;
    if (streak >= 5) return <Badge className="bg-primary text-primary-foreground">📈 On Fire</Badge>;
    if (streak >= 3) return <Badge variant="secondary">🎯 Consistent</Badge>;
    return null;
  };

  // Calculate stats from scorecard leaderboard
  const topScore = scorecardLeaderboard.length > 0 ? scorecardLeaderboard[0]?.total_score || 0 : 0;
  const completedCount = scorecardLeaderboard.filter(e => e.completed_days >= (campaign?.days_count || 7)).length;

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {campaign ? `${campaign.title} - Leaderboard` : 'Challenge Leaderboard'}
          </h1>
          <p className="text-muted-foreground">
            Ranked by scorecard points (consistency + rules + discipline)
          </p>
          {campaign && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scorecardLeaderboard.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="h-6 w-6 text-success-foreground" />
            </div>
            <CardTitle className="text-base">Top Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{topScore}</div>
            <p className="text-xs text-muted-foreground">points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">all {campaign?.days_count || 7} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="scorecard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scorecard" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Scorecard Ranking
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Submission Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scorecard">
            <ScorecardLeaderboard 
              leaderboard={scorecardLeaderboard}
              loading={scorecardLoading}
              daysCount={campaign?.days_count || 7}
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="submissions">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Trader Rankings (By Submissions)
                </CardTitle>
                <CardDescription>
                  Ranked by total submissions and current streak
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissionLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to submit your trade idea!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissionLeaderboard.map((participant, index) => {
                      const rank = index + 1;
                      const username = participant.profiles?.username || 
                                       participant.profiles?.full_name || 
                                       `Trader${participant.user_id.slice(-4)}`;
                      const completionPercentage = Math.round(participant.completion_rate);
                      
                      return (
                        <div
                          key={participant.id}
                          className={`
                            p-4 rounded-lg border transition-all
                            ${rank <= 3 
                              ? 'bg-gradient-to-r from-primary/5 to-success/5 border-primary/20' 
                              : 'bg-muted/30 border-border'
                            }
                          `}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {getRankIcon(rank)}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-lg">{username}</h3>
                                  {getRankBadge(rank)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                  <span>{participant.total_submissions}/{campaign?.days_count || 7} days</span>
                                  <span>•</span>
                                  <span>{completionPercentage}% complete</span>
                                  <span>•</span>
                                  <span>Streak: {participant.current_streak || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                              {getStreakBadge(participant.current_streak || 0)}
                              <div className="w-full sm:w-24">
                                <Progress value={completionPercentage} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scoring Info */}
      <Card className="bg-muted/30 mt-8">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            🏆 <strong>Scorecard Ranking</strong>: Winners are selected based on consistency, discipline, and rule compliance. 
            Trading profit or loss is <strong>NOT</strong> part of the scoring system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;