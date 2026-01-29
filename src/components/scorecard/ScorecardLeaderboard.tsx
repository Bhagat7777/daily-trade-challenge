import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal,
  Crown,
  Star,
  CheckCircle
} from 'lucide-react';
import { LeaderboardEntry } from '@/hooks/useScorecard';

interface ScorecardLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  loading?: boolean;
  daysCount?: number;
  currentUserId?: string;
}

const ScorecardLeaderboard: React.FC<ScorecardLeaderboardProps> = ({ 
  leaderboard, 
  loading,
  daysCount = 7,
  currentUserId
}) => {
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

  const getRankBgClass = (rank: number) => {
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

  if (leaderboard.length === 0) {
    return (
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Scorecard Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No participants yet. Be the first to submit!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Scorecard Leaderboard
        </CardTitle>
        <CardDescription>
          Ranked by total score (consistency + rule compliance + discipline)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isCurrentUser = currentUserId === entry.user_id;
            const isCompleted = entry.completed_days >= daysCount;

            return (
              <div 
                key={entry.user_id}
                className={`
                  flex items-center justify-between p-4 rounded-lg border-2 transition-all
                  ${getRankBgClass(entry.rank)}
                  ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {entry.username || entry.full_name || 'Anonymous'}
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.completed_days}/{daysCount} days completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex gap-2 text-xs">
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

        {/* Scoring Note */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <strong>C</strong> = Consistency (10pts/day) | 
            <strong> R</strong> = Rule Compliance (hashtag +2, tag +1) | 
            <strong> D</strong> = Discipline (chart +1, analysis +1)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScorecardLeaderboard;
