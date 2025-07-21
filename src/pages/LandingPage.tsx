import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import SocialLinks from '@/components/ui/social-links';
import { 
  TrendingUp, 
  Calendar, 
  Trophy, 
  CheckCircle, 
  Twitter, 
  BarChart3, 
  Users,
  Target,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-success">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <BarChart3 className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              15 Days of Trading
              <span className="block text-primary">Journal Challenge</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build consistency, track your progress, and join a community of traders 
              committed to daily journaling and improvement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-primary hover:opacity-90 shadow-success text-lg px-8 py-3"
            >
              {user ? 'Go to Dashboard' : 'Join the Challenge'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/rules')}
              className="text-lg px-8 py-3"
            >
              Learn the Rules
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Join 1000+ traders</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>15 day challenge</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              <span>Build consistency</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-card shadow-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>1. Join the Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sign up and commit to 15 days of consistent trading journal entries.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>2. Post Daily Trade Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your trade analysis, chart, and strategy every day for 15 days.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>3. Stay Consistent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build a habit, track your progress, and compete on the consistency leaderboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Challenge Rules</h2>
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-success" />
                  Participation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm font-bold mt-0.5">1</div>
                  <p>Submit <strong>1 trade idea daily</strong> for 15 consecutive days</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm font-bold mt-0.5">2</div>
                  <p>Each post must include your <strong>chart analysis and strategy</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm font-bold mt-0.5">3</div>
                  <div>Post on Twitter with hashtag <Badge variant="secondary">#15DaysofTrading</Badge></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm font-bold mt-0.5">4</div>
                  <div>Tag <Badge variant="secondary">@free_propfirm</Badge> in your Twitter post</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm font-bold mt-0.5">5</div>
                  <p>Include the Twitter post link in your journal submission</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Twitter Template Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Twitter Post Template</h2>
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="h-6 w-6 text-chart" />
                  Use This Format
                </CardTitle>
                <CardDescription>
                  Copy this template for your daily Twitter posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg border-l-4 border-l-primary">
                  <p className="text-sm font-mono">
                    📈 Day X/15 of my trading journal challenge<br /><br />
                    
                    💡 Trade Idea: [Your analysis here]<br />
                    📊 Pair: [e.g., EURUSD]<br />
                    🎯 Strategy: [Your strategy]<br /><br />
                    
                    #15DaysofTrading @free_propfirm<br /><br />
                    
                    [Attach your chart image]
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-center">Stay Connected</CardTitle>
                <CardDescription className="text-center">
                  Follow us for trading tips, updates, and community support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialLinks />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Build Consistency?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of traders who are building better trading habits through daily journaling.
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-primary hover:opacity-90 shadow-success text-lg px-8 py-3"
            >
              <Zap className="mr-2 h-5 w-5" />
              {user ? 'Go to Dashboard' : 'Start Your Journey'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;