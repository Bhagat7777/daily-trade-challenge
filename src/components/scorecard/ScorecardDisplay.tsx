import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  CheckCircle, 
  XCircle, 
  Award,
  TrendingUp,
  Shield,
  Brain
} from 'lucide-react';
import { Scorecard, DailySubmissionStatus } from '@/hooks/useScorecard';

interface ScorecardDisplayProps {
  scorecard: Scorecard | null;
  dailyStatus: DailySubmissionStatus[];
  daysCount?: number;
}

const ScorecardDisplay: React.FC<ScorecardDisplayProps> = ({ 
  scorecard, 
  dailyStatus,
  daysCount = 7 
}) => {
  const consistencyMax = daysCount * 10;
  const ruleMax = 20;
  const disciplineMax = 10;
  const totalMax = consistencyMax + ruleMax + disciplineMax;

  const consistency = scorecard?.consistency_score || 0;
  const rule = scorecard?.rule_score || 0;
  const discipline = scorecard?.discipline_score || 0;
  const total = scorecard?.total_score || 0;
  const completedDays = scorecard?.completed_days || 0;

  return (
    <div className="space-y-6">
      {/* Total Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Your Total Score
          </CardTitle>
          <CardDescription>
            Based on consistency, rule compliance, and discipline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-primary">{total}</span>
            <span className="text-2xl text-muted-foreground mb-1">/ {totalMax}</span>
          </div>
          <Progress value={(total / totalMax) * 100} className="h-3 mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedDays} of {daysCount} days completed
          </p>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consistency Score */}
        <Card className="bg-gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold">{consistency}</span>
              <span className="text-lg text-muted-foreground">/ {consistencyMax}</span>
            </div>
            <Progress 
              value={(consistency / consistencyMax) * 100} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              +10 points per valid trading day
            </p>
          </CardContent>
        </Card>

        {/* Rule Compliance Score */}
        <Card className="bg-gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Rule Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold">{rule}</span>
              <span className="text-lg text-muted-foreground">/ {ruleMax}</span>
            </div>
            <Progress 
              value={(rule / ruleMax) * 100} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              +2 hashtag, +1 tag per day (max 20)
            </p>
          </CardContent>
        </Card>

        {/* Discipline Score */}
        <Card className="bg-gradient-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              Discipline & Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold">{discipline}</span>
              <span className="text-lg text-muted-foreground">/ {disciplineMax}</span>
            </div>
            <Progress 
              value={(discipline / disciplineMax) * 100} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              +1 chart, +1 analysis per day (max 10)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Status Grid */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Submission Status
          </CardTitle>
          <CardDescription>
            Track your progress for each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyStatus.map((day) => (
              <div 
                key={day.day}
                className={`
                  flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border
                  ${day.submitted 
                    ? 'bg-success/10 border-success/30' 
                    : 'bg-muted/30 border-muted'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                    ${day.submitted ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {day.day}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Day {day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                  {day.submitted ? (
                    <>
                      <Badge 
                        variant={day.has_hashtag ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0.5"
                      >
                        {day.has_hashtag ? <CheckCircle className="h-3 w-3 mr-0.5" /> : <XCircle className="h-3 w-3 mr-0.5" />}
                        #
                      </Badge>
                      <Badge 
                        variant={day.has_tagged_account ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0.5"
                      >
                        {day.has_tagged_account ? <CheckCircle className="h-3 w-3 mr-0.5" /> : <XCircle className="h-3 w-3 mr-0.5" />}
                        @
                      </Badge>
                      <Badge 
                        variant={day.has_chart ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0.5"
                      >
                        {day.has_chart ? <CheckCircle className="h-3 w-3 mr-0.5" /> : <XCircle className="h-3 w-3 mr-0.5" />}
                        📊
                      </Badge>
                      <Badge 
                        variant={day.has_analysis ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0.5"
                      >
                        {day.has_analysis ? <CheckCircle className="h-3 w-3 mr-0.5" /> : <XCircle className="h-3 w-3 mr-0.5" />}
                        📝
                      </Badge>
                      <Badge 
                        variant={day.has_trade_idea ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0.5"
                      >
                        {day.has_trade_idea ? <CheckCircle className="h-3 w-3 mr-0.5" /> : <XCircle className="h-3 w-3 mr-0.5" />}
                        💡
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Not submitted
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Rules */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            🏆 The scorecard rewards consistency, discipline, and rule compliance. 
            Trading profit or loss is <strong>NOT</strong> part of the scoring system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScorecardDisplay;
