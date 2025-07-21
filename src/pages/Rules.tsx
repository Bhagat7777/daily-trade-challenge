import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Twitter, Calendar, Trophy, ArrowRight } from 'lucide-react';
import SocialLinks from '@/components/ui/social-links';

const Rules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Challenge Rules</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Follow these simple rules to participate in the 15 Days Trading Journal Challenge
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-success" />
                Participation Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-foreground font-bold">1</div>
                  <div>
                    <h3 className="font-semibold">Daily Submissions</h3>
                    <p className="text-muted-foreground">Submit 1 trade idea daily for 15 consecutive days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-foreground font-bold">2</div>
                  <div>
                    <h3 className="font-semibold">Quality Analysis</h3>
                    <p className="text-muted-foreground">Include detailed chart analysis and trading strategy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-foreground font-bold">3</div>
                  <div>
                    <h3 className="font-semibold">Twitter Post</h3>
                    <div className="text-muted-foreground">
                      Post on Twitter with <Badge variant="secondary">#15DaysofTrading</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-foreground font-bold">4</div>
                  <div>
                    <h3 className="font-semibold">Tag Requirement</h3>
                    <div className="text-muted-foreground">
                      Tag <Badge variant="secondary">@free_propfirm</Badge> in your post
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-foreground font-bold">5</div>
                  <div>
                    <h3 className="font-semibold">Link Submission</h3>
                    <p className="text-muted-foreground">Include the Twitter post link in your journal submission</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Twitter className="h-6 w-6 text-chart" />
                Twitter Post Template
              </CardTitle>
              <CardDescription>Use this format for your daily posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg border-l-4 border-l-primary">
                <pre className="text-sm whitespace-pre-wrap">
{`📈 Day X/15 of my trading journal challenge

💡 Trade Idea: [Your analysis here]
📊 Pair: [e.g., EURUSD]
🎯 Strategy: [Your strategy]

#15DaysofTrading @free_propfirm

[Attach your chart image]`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-center">Connect With Us</CardTitle>
              <CardDescription className="text-center">
                Follow our social media for updates, tips, and community support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialLinks />
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-primary hover:opacity-90"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;