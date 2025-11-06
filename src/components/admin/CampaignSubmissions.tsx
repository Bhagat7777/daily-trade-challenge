import { useState, useMemo } from 'react';
import { useCampaignSubmissions, TraderData } from '@/hooks/useCampaignSubmissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Loader2,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const TraderSubmissionCard = ({ traderData, campaignDays, index }: { traderData: TraderData, campaignDays: number, index: number }) => {
  const { profile, submissions, totalSubmissions } = traderData;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{profile.full_name || profile.username}</CardTitle>
              <CardDescription>{profile.username}</CardDescription>
            </div>
            <Badge variant="outline">
              {totalSubmissions} / {campaignDays} Submitted
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: campaignDays }, (_, i) => i + 1).map(day => {
              const submission = submissions.get(day);
              return (
                <div
                  key={day}
                  className={`p-2 rounded-md text-center border ${
                    submission ? 'bg-success/10 border-success/20' : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="font-bold text-sm">Day {day}</div>
                  {submission ? (
                    <div className="mt-1 flex flex-col items-center gap-1">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <a href={submission.twitter_link} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </Button>
                      </a>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(submission.created_at), 'MMM dd')}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-col items-center gap-1">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <p className="text-xs text-muted-foreground mt-1">Missing</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const CampaignSubmissions = () => {
  const { activeCampaign, traders, loading } = useCampaignSubmissions();
  const [searchTerm, setSearchTerm] = useState('');

  const activeDays = useMemo(() => {
    if (!activeCampaign) return 0;
    const daysElapsed = Math.max(0, new Date().getTime() - new Date(activeCampaign.start_date).getTime());
    return Math.min(
      Math.floor(daysElapsed / (1000 * 60 * 60 * 24)) + 1,
      activeCampaign.days_count
    );
  }, [activeCampaign]);

  const filteredTraders = useMemo(() => {
    let tradersArray = Array.from(traders.values());

    // Filter to only show traders who submitted today (current active day)
    if (activeDays > 0) {
      tradersArray = tradersArray.filter(trader => trader.submissions.has(activeDays));
    } else {
      return []; // If campaign hasn't started, show no one
    }

    // Then, filter by search term
    if (searchTerm) {
      tradersArray = tradersArray.filter(trader =>
        trader.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trader.profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trader.profile.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return tradersArray;
  }, [traders, searchTerm, activeDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Campaign Submissions...</p>
      </div>
    );
  }

  if (!activeCampaign) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <CardTitle>No Active Campaign</CardTitle>
          <CardDescription>There is currently no live campaign to display submissions for.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Summary */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Today's Submissions Summary (Day {activeDays})</CardTitle>
          <CardDescription>Overview of the currently active campaign for today.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg"><TrendingUp className="h-6 w-6 text-primary" /></div>
            <div>
              <div className="text-sm text-muted-foreground">Campaign Name</div>
              <div className="font-semibold">{activeCampaign.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg"><Users className="h-6 w-6 text-primary" /></div>
            <div>
              <div className="text-sm text-muted-foreground">Traders Submitted Today</div>
              <div className="font-semibold">{filteredTraders.length} / {traders.size}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg"><Calendar className="h-6 w-6 text-primary" /></div>
            <div>
              <div className="text-sm text-muted-foreground">Active Days</div>
              <div className="font-semibold">{activeDays} / {activeCampaign.days_count}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Trader List */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Filter by trader name, username, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredTraders.map((traderData, index) => (
              <TraderSubmissionCard
                key={traderData.profile.id}
                traderData={traderData}
                campaignDays={activeCampaign.days_count}
                index={index}
              />
            ))}
          </AnimatePresence>
          {filteredTraders.length === 0 && (
            <Card className="text-center py-12">
              <CardDescription>
                {searchTerm 
                  ? "No traders found matching your search." 
                  : "No submissions have been made for today yet."
                }
              </CardDescription>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};