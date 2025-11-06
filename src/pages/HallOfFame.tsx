import React, { useState, useMemo } from 'react';
import { useTradingJournal } from '@/hooks/useTradingJournal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  Star,
  Flame,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Copy,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HallOfFame = () => {
  const { leaderboard, loading } = useTradingJournal();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');

  // Get top performers with different criteria
  const topPerformers = useMemo(() => {
    if (!leaderboard.length) return { topStreakers: [], topConsistent: [], topSubmitters: [], winners: [] };

    // Sort by different criteria
    const topStreakers = [...leaderboard]
      .sort((a, b) => (b.longest_streak || 0) - (a.longest_streak || 0))
      .slice(0, 10);

    const topConsistent = [...leaderboard]
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 10);

    const topSubmitters = [...leaderboard]
      .sort((a, b) => b.total_submissions - a.total_submissions)
      .slice(0, 10);

    // Winners are those who completed the 15-day challenge
    const winners = leaderboard.filter(p => p.total_submissions >= 15);

    return { topStreakers, topConsistent, topSubmitters, winners };
  }, [leaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
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
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-primary-foreground">🏆 Champion</Badge>;
      case 2:
        return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-primary-foreground">🥈 Runner-up</Badge>;
      case 3:
        return <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-primary-foreground">🥉 Third Place</Badge>;
      default:
        return <Badge variant="secondary">#{rank}</Badge>;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const HallOfFameCard = ({ participant, rank, category }: { participant: any, rank: number, category: string }) => {
    const username = participant.profiles?.username || 
                    participant.profiles?.full_name || 
                    `Trader${participant.user_id.slice(-4)}`;
    
    const completionPercentage = Math.round(participant.completion_rate);
    const isWinner = participant.total_submissions >= 15;

    return (
      <Card className={`
        transition-all hover:shadow-success
        ${rank <= 3 
          ? 'bg-gradient-to-br from-primary/5 to-success/5 border-primary/20 shadow-card' 
          : 'bg-gradient-card border-border'
        }
      `}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getRankIcon(rank)}
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {username}
                  {isWinner && <CheckCircle className="h-4 w-4 text-success" />}
                </h3>
                <p className="text-sm text-muted-foreground">{category}</p>
              </div>
            </div>
            {getRankBadge(rank)}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{participant.total_submissions}</div>
              <div className="text-xs text-muted-foreground">Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{participant.longest_streak || 0}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart">{completionPercentage}%</div>
              <div className="text-xs text-muted-foreground">Completion</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Challenge Progress</span>
              <span className="font-medium">{participant.total_submissions}/15</span>
            </div>
            <Progress value={(participant.total_submissions / 15) * 100} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(username, "Username")}
              className="flex-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Name
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(participant.user_id, "User ID")}
              className="flex-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Copy ID
            </Button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mt-3">
            {isWinner && (
              <Badge className="bg-gradient-success text-success-foreground">
                <Trophy className="h-3 w-3 mr-1" />
                Winner
              </Badge>
            )}
            {participant.longest_streak >= 10 && (
              <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-primary-foreground">
                <Flame className="h-3 w-3 mr-1" />
                Streak Master
              </Badge>
            )}
            {participant.completion_rate >= 90 && (
              <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-primary-foreground">
                <Target className="h-3 w-3 mr-1" />
                Consistent
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Hall of Fame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto shadow-success">
          <Crown className="h-10 w-10 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Hall of Fame
          </h1>
          <p className="text-muted-foreground text-lg">
            Celebrating our most dedicated and consistent traders
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-6 w-6 text-success-foreground" />
            </div>
            <CardTitle className="text-base">Winners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{topPerformers.winners.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-base">Best Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart">
              {topPerformers.topStreakers[0]?.longest_streak || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-base">Top Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {topPerformers.topConsistent[0] ? Math.round(topPerformers.topConsistent[0].completion_rate) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{leaderboard.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Hall of Fame Categories */}
      <Tabs defaultValue="winners" className="space-y-6 mt-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="winners" className="flex items-center gap-2 text-xs sm:text-sm">
            <Trophy className="h-4 w-4" />
            Winners
          </TabsTrigger>
          <TabsTrigger value="streakers" className="flex items-center gap-2 text-xs sm:text-sm">
            <Flame className="h-4 w-4" />
            Streakers
          </TabsTrigger>
          <TabsTrigger value="consistent" className="flex items-center gap-2 text-xs sm:text-sm">
            <Target className="h-4 w-4" />
            Consistent
          </TabsTrigger>
          <TabsTrigger value="submitters" className="flex items-center gap-2 text-xs sm:text-sm">
            <Star className="h-4 w-4" />
            Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="winners">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-success" />
                Challenge Winners
              </CardTitle>
              <CardDescription>
                Traders who completed all 15 days of the trading journal challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topPerformers.winners.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No winners yet</h3>
                  <p className="text-muted-foreground">
                    Complete all 15 days to become a challenge winner!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topPerformers.winners.map((participant, index) => (
                    <HallOfFameCard
                      key={participant.id}
                      participant={participant}
                      rank={index + 1}
                      category="Challenge Winner"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streakers">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-chart" />
                Top Streakers
              </CardTitle>
              <CardDescription>
                Traders with the longest consecutive submission streaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topPerformers.topStreakers.map((participant, index) => (
                  <HallOfFameCard
                    key={participant.id}
                    participant={participant}
                    rank={index + 1}
                    category="Streak Master"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistent">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Most Consistent
              </CardTitle>
              <CardDescription>
                Traders with the highest completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topPerformers.topConsistent.map((participant, index) => (
                  <HallOfFameCard
                    key={participant.id}
                    participant={participant}
                    rank={index + 1}
                    category="Consistency Champion"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submitters">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-warning" />
                Most Active
              </CardTitle>
              <CardDescription>
                Traders with the most total submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topPerformers.topSubmitters.map((participant, index) => (
                  <HallOfFameCard
                    key={participant.id}
                    participant={participant}
                    rank={index + 1}
                    category="Activity Leader"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HallOfFame;