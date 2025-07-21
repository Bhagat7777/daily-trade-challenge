import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTradingJournal } from '@/hooks/useTradingJournal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import SocialLinks from '@/components/ui/social-links';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Flame, 
  Plus,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userStats, loading, canSubmitToday, getCalendarData } = useTradingJournal();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const calendarData = getCalendarData();
  const currentDay = userStats ? 
    Math.min(calendarData.findIndex(day => day.isToday) + 1, 15) : 1;
  const progressPercentage = userStats ? 
    Math.round((userStats.total_submissions / 15) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Day</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Day {currentDay} of 15</div>
              <p className="text-xs text-muted-foreground">
                {15 - currentDay} days remaining
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.total_submissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                out of 15 total days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground">
                consecutive days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.completion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                of challenge completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Challenge Progress</CardTitle>
            <CardDescription>
              Your journey through the 15-day trading journal challenge
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
                {userStats?.total_submissions || 0} / 15 days completed
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
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>15-Day Calendar Tracker</CardTitle>
            <CardDescription>
              Track your daily submission progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {calendarData.map((day) => (
                <div
                  key={day.day}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${day.hasSubmission 
                      ? 'border-success bg-success/10' 
                      : day.isToday 
                        ? 'border-primary bg-primary/10' 
                        : day.isPast 
                          ? 'border-destructive bg-destructive/10'
                          : 'border-muted bg-muted/50'
                    }
                  `}
                >
                  <div className="text-center space-y-2">
                    <div className="text-sm font-medium">Day {day.day}</div>
                    <div className="flex justify-center">
                      {day.hasSubmission ? (
                        <CheckCircle className="h-6 w-6 text-success" />
                      ) : day.isToday ? (
                        <Clock className="h-6 w-6 text-primary" />
                      ) : day.isPast ? (
                        <XCircle className="h-6 w-6 text-destructive" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Ready for Today's Submission?</CardTitle>
            <CardDescription>
              {canSubmitToday() 
                ? "Submit your trade idea for today to keep your streak going!"
                : "You've already submitted today. Great job maintaining consistency!"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/submit')}
                disabled={!canSubmitToday()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="mr-2 h-4 w-4" />
                {canSubmitToday() ? "Submit Today's Trade Idea" : "Today's Submission Complete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/leaderboard')}
              >
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Stay Connected
              <SocialLinks variant="compact" />
            </CardTitle>
            <CardDescription>
              Follow us for trading tips, updates, and community support
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;