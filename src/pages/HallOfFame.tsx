import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Trophy, 
  Medal, 
  Crown,
  Star,
  Flame,
  Target,
  Users,
  Copy,
  ExternalLink,
  CheckCircle,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
}

interface Participant {
  id: string;
  user_id: string;
  total_submissions: number;
  current_streak: number;
  longest_streak: number;
  completion_rate: number;
  campaign_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  } | null;
}

interface CampaignLeaderboard {
  campaign: Campaign;
  participants: Participant[];
  isOpen: boolean;
}

const HallOfFame = () => {
  const { toast } = useToast();
  const [campaignLeaderboards, setCampaignLeaderboards] = useState<CampaignLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCampaignsWithLeaderboards();
  }, []);

  const fetchAllCampaignsWithLeaderboards = async () => {
    try {
      // Fetch all campaigns (ended and live)
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, title, start_date, end_date, days_count, status')
        .in('status', ['live', 'ended'])
        .order('start_date', { ascending: false });

      if (campaignsError) throw campaignsError;

      if (!campaigns || campaigns.length === 0) {
        setCampaignLeaderboards([]);
        setLoading(false);
        return;
      }

      // Fetch participants for all campaigns
      const { data: participants, error: participantsError } = await supabase
        .from('challenge_participants')
        .select(`
          id,
          user_id,
          total_submissions,
          current_streak,
          longest_streak,
          completion_rate,
          campaign_id,
          profiles (
            username,
            full_name
          )
        `)
        .in('campaign_id', campaigns.map(c => c.id))
        .order('total_submissions', { ascending: false });

      if (participantsError) throw participantsError;

      // Group participants by campaign
      const leaderboards: CampaignLeaderboard[] = campaigns.map((campaign, index) => ({
        campaign,
        participants: (participants || []).filter(p => p.campaign_id === campaign.id),
        isOpen: index === 0 // First campaign (most recent) is open by default
      }));

      setCampaignLeaderboards(leaderboards);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load Hall of Fame data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = (campaignId: string) => {
    setCampaignLeaderboards(prev => 
      prev.map(lb => 
        lb.campaign.id === campaignId 
          ? { ...lb, isOpen: !lb.isOpen }
          : lb
      )
    );
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {rank}
          </div>
        );
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'live') {
      return <Badge className="bg-success text-success-foreground">Live</Badge>;
    }
    return <Badge variant="secondary">Completed</Badge>;
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

  // Calculate overall stats
  const totalParticipants = new Set(campaignLeaderboards.flatMap(lb => lb.participants.map(p => p.user_id))).size;
  const totalWinners = campaignLeaderboards.reduce((acc, lb) => 
    acc + lb.participants.filter(p => p.total_submissions >= lb.campaign.days_count).length, 0
  );
  const bestStreak = Math.max(...campaignLeaderboards.flatMap(lb => lb.participants.map(p => p.longest_streak || 0)), 0);

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
            Historical leaderboards from all competitions
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-sm">Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{campaignLeaderboards.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="h-5 w-5 text-success-foreground" />
            </div>
            <CardTitle className="text-sm">Winners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalWinners}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-sm">Best Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart">{bestStreak}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card text-center">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle className="text-sm">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Leaderboards */}
      <div className="space-y-4 mt-8">
        {campaignLeaderboards.length === 0 ? (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Competitions Yet</h3>
              <p className="text-muted-foreground">
                Check back after the first competition ends!
              </p>
            </CardContent>
          </Card>
        ) : (
          campaignLeaderboards.map((lb) => (
            <Collapsible
              key={lb.campaign.id}
              open={lb.isOpen}
              onOpenChange={() => toggleCampaign(lb.campaign.id)}
            >
              <Card className="bg-gradient-card shadow-card overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {lb.campaign.title}
                            {getStatusBadge(lb.campaign.status)}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(lb.campaign.start_date), 'MMM dd')} - {format(new Date(lb.campaign.end_date), 'MMM dd, yyyy')} • {lb.participants.length} participants
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {lb.participants.filter(p => p.total_submissions >= lb.campaign.days_count).length} winners
                        </Badge>
                        <ChevronDown className={`h-5 w-5 transition-transform ${lb.isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {lb.participants.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No participants in this competition
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Header row */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                          <div className="col-span-1">#</div>
                          <div className="col-span-4">Trader</div>
                          <div className="col-span-2 text-center">Submissions</div>
                          <div className="col-span-2 text-center">Streak</div>
                          <div className="col-span-3 text-center">Progress</div>
                        </div>

                        {/* Participant rows */}
                        {lb.participants.map((participant, index) => {
                          const username = participant.profiles?.username || 
                                          participant.profiles?.full_name || 
                                          `Trader${participant.user_id.slice(-4)}`;
                          const isWinner = participant.total_submissions >= lb.campaign.days_count;
                          const progressPercent = Math.min(100, (participant.total_submissions / lb.campaign.days_count) * 100);

                          return (
                            <div 
                              key={participant.id}
                              className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-lg items-center ${
                                index < 3 ? 'bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="col-span-1">
                                {getRankIcon(index + 1)}
                              </div>
                              <div className="col-span-4 flex items-center gap-2">
                                <span className="font-medium truncate">{username}</span>
                                {isWinner && <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />}
                              </div>
                              <div className="col-span-2 text-center font-semibold text-primary">
                                {participant.total_submissions}/{lb.campaign.days_count}
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="inline-flex items-center gap-1">
                                  <Flame className="h-3 w-3 text-orange-500" />
                                  {participant.longest_streak || 0}
                                </span>
                              </div>
                              <div className="col-span-3">
                                <div className="flex items-center gap-2">
                                  <Progress value={progressPercent} className="h-2 flex-1" />
                                  <span className="text-xs text-muted-foreground w-10">
                                    {Math.round(progressPercent)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
};

export default HallOfFame;
