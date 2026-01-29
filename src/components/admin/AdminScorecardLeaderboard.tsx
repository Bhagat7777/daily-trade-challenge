import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trophy, 
  Medal,
  Crown,
  Star,
  CheckCircle,
  Download,
  Filter,
  Shuffle,
  Users
} from 'lucide-react';
import { useScorecard, LeaderboardEntry } from '@/hooks/useScorecard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminScorecardLeaderboardProps {
  campaignId?: string;
}

const AdminScorecardLeaderboard: React.FC<AdminScorecardLeaderboardProps> = ({ campaignId }) => {
  const { leaderboard, loading, selectWinnersWithTieBreaker } = useScorecard(campaignId);
  const { toast } = useToast();
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState<LeaderboardEntry[]>([]);
  const [daysCount, setDaysCount] = useState(7);

  useEffect(() => {
    const fetchCampaignDays = async () => {
      if (!campaignId) {
        const { data } = await supabase
          .from('campaigns')
          .select('days_count')
          .eq('is_active', true)
          .maybeSingle();
        setDaysCount(data?.days_count || 7);
      } else {
        const { data } = await supabase
          .from('campaigns')
          .select('days_count')
          .eq('id', campaignId)
          .single();
        setDaysCount(data?.days_count || 7);
      }
    };
    fetchCampaignDays();
  }, [campaignId]);

  const filteredLeaderboard = showOnlyCompleted 
    ? leaderboard.filter(e => e.completed_days >= daysCount)
    : leaderboard;

  const handleSelectWinners = async () => {
    const winners = await selectWinnersWithTieBreaker(7);
    setSelectedWinners(winners);
    toast({
      title: "Winners Selected",
      description: `${winners.length} winners have been selected based on scores and tie-breaker rules.`,
    });
  };

  const handleExportCSV = () => {
    const dataToExport = selectedWinners.length > 0 ? selectedWinners : filteredLeaderboard;
    
    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no entries to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Rank',
      'Username',
      'Full Name',
      'Consistency Score',
      'Rule Score',
      'Discipline Score',
      'Total Score',
      'Completed Days'
    ];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map((entry, index) => [
        index + 1,
        entry.username || 'Anonymous',
        entry.full_name || 'Anonymous',
        entry.consistency_score,
        entry.rule_score,
        entry.discipline_score,
        entry.total_score,
        entry.completed_days
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scorecard-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${dataToExport.length} entries to CSV.`,
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBgClass = (rank: number, isWinner: boolean) => {
    if (isWinner) {
      return 'bg-gradient-to-r from-success/20 to-success/5 border-success/50';
    }
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30';
      default:
        return 'bg-gradient-card';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Scorecard Leaderboard (Admin)
            </CardTitle>
            <CardDescription>
              View scores, select winners, and export data
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectWinners}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Select Top 7 Winners
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="show-completed"
              checked={showOnlyCompleted}
              onCheckedChange={(checked) => setShowOnlyCompleted(!!checked)}
            />
            <label htmlFor="show-completed" className="text-sm cursor-pointer">
              Show only completed ({daysCount} days)
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {filteredLeaderboard.length} participants
          </div>
          {selectedWinners.length > 0 && (
            <Badge variant="default" className="ml-auto">
              {selectedWinners.length} Winners Selected
            </Badge>
          )}
        </div>

        {/* Winner Selection Message */}
        {selectedWinners.length > 0 && (
          <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
            <p className="text-sm font-medium text-success flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Winners are selected based on total score. Ties are broken randomly.
            </p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          {filteredLeaderboard.map((entry, index) => {
            const isWinner = selectedWinners.some(w => w.user_id === entry.user_id);
            const isCompleted = entry.completed_days >= daysCount;

            return (
              <div 
                key={entry.user_id}
                className={`
                  flex items-center justify-between p-4 rounded-lg border-2 transition-all
                  ${getRankBgClass(index + 1, isWinner)}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {isWinner ? (
                      <Trophy className="h-5 w-5 text-success" />
                    ) : (
                      getRankIcon(index + 1)
                    )}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {entry.username || entry.full_name || 'Anonymous'}
                      {isWinner && (
                        <Badge className="bg-success text-success-foreground text-xs">
                          Winner
                        </Badge>
                      )}
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.completed_days}/{daysCount} days | User ID: {entry.user_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-2 text-xs">
                    <Badge variant="secondary">C: {entry.consistency_score}</Badge>
                    <Badge variant="secondary">R: {entry.rule_score}</Badge>
                    <Badge variant="secondary">D: {entry.discipline_score}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-xl font-bold">{entry.total_score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLeaderboard.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No participants match the current filter.
          </p>
        )}

        {/* Scoring Note */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Winners are selected based on consistency and rule-following. 
            <strong> Profit is NOT considered.</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminScorecardLeaderboard;
