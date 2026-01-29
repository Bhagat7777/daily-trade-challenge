import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTradingJournal } from '@/hooks/useTradingJournal';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { 
  Upload, 
  Twitter, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  FileImage,
  Lock,
  CalendarDays,
  Info,
  Hash,
  AtSign
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Campaign {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  days_count: number;
  rules?: string | null;
}

const SubmitTrade = () => {
  const { user } = useAuth();
  const { submitTradeIdea, canSubmitToday, userStats, loading: journalLoading } = useTradingJournal();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId?: string }>();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [isDayUnlocked, setIsDayUnlocked] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    tradeIdea: '',
    twitterLink: '',
    marketPair: '',
    chartImageUrl: '',
    hasHashtag: false,
    hasTaggedAccount: false,
  });
  const [chartFile, setChartFile] = useState<File | null>(null);
  const [twitterScreenshot, setTwitterScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const marketPairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'EURAUD', 'GBPAUD', 'NZDJPY',
    'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD', 'US30', 'US500', 'NAS100'
  ];

  // Fetch active campaign and calculate current day
  useEffect(() => {
    const fetchCampaignAndCalculateDay = async () => {
      try {
        // Update campaign statuses first
        await supabase.rpc('update_campaign_status');

        let campaign: Campaign | null = null;

        if (campaignId) {
          const { data, error } = await supabase
            .from('campaigns')
            .select('id, title, start_date, end_date, status, days_count, rules')
            .eq('id', campaignId)
            .maybeSingle();
          
          if (error) throw error;
          campaign = data;
        } else {
          const { data, error } = await supabase
            .from('campaigns')
            .select('id, title, start_date, end_date, status, days_count, rules')
            .eq('is_active', true)
            .eq('status', 'live')
            .maybeSingle();
          
          if (error) throw error;
          campaign = data;
        }

        if (campaign) {
          setActiveCampaign(campaign);
          
          // Calculate current day based on campaign start date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(campaign.start_date);
          startDate.setHours(0, 0, 0, 0);
          
          const daysSinceStart = differenceInDays(today, startDate) + 1;
          const calculatedDay = Math.max(1, Math.min(daysSinceStart, campaign.days_count));
          
          setCurrentDay(calculatedDay);
          
          // Check if today is unlocked (campaign has started and we're within campaign period)
          const endDate = new Date(campaign.end_date);
          endDate.setHours(23, 59, 59, 999);
          setIsDayUnlocked(today >= startDate && today <= endDate);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setCampaignLoading(false);
      }
    };

    fetchCampaignAndCalculateDay();
  }, [campaignId]);

  if (journalLoading || campaignLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading submission form...</p>
        </div>
      </div>
    );
  }

  // Check if no active campaign
  if (!activeCampaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-gradient-card shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>No Active Campaign</CardTitle>
              <CardDescription>
                There is no active trading campaign at the moment. Please check back later.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => navigate('/campaigns')}
                className="bg-gradient-primary hover:opacity-90"
              >
                View Campaigns
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if day is locked (campaign hasn't started yet or outside campaign period)
  if (!isDayUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-gradient-card shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Day Locked</CardTitle>
              <CardDescription>
                This day is not yet unlocked. The campaign runs from{' '}
                {format(new Date(activeCampaign.start_date), 'MMM dd, yyyy')} to{' '}
                {format(new Date(activeCampaign.end_date), 'MMM dd, yyyy')}.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-primary hover:opacity-90"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!canSubmitToday()) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-gradient-card shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle>Today's Submission Complete!</CardTitle>
              <CardDescription>
                You've already submitted your trade idea for today. Great job staying consistent!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-primary hover:opacity-90"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleChartFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please choose an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setChartFile(file);
    }
  };

  const handleTwitterScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please choose an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setTwitterScreenshot(file);
    }
  };

  const validateTwitterLink = (link: string) => {
    const twitterPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    return twitterPattern.test(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tradeIdea.trim()) {
      toast({
        title: "Missing trade idea",
        description: "Please provide your trade analysis",
        variant: "destructive",
      });
      return;
    }

    if (!formData.twitterLink.trim()) {
      toast({
        title: "Missing Twitter link",
        description: "Please provide the link to your Twitter post",
        variant: "destructive",
      });
      return;
    }

    if (!validateTwitterLink(formData.twitterLink)) {
      toast({
        title: "Invalid Twitter link",
        description: "Please provide a valid Twitter/X post link",
        variant: "destructive",
      });
      return;
    }

    if (!twitterScreenshot) {
      toast({
        title: "Twitter screenshot required",
        description: "Please upload a screenshot of your Twitter post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await submitTradeIdea(
      formData.tradeIdea,
      formData.twitterLink,
      formData.marketPair,
      formData.chartImageUrl,
      chartFile || undefined,
      twitterScreenshot,
      activeCampaign?.id,
      currentDay,
      formData.hasHashtag,
      formData.hasTaggedAccount
    );

    if (!error) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-primary">
                {activeCampaign.title}
              </span>
            </div>
            <h1 className="text-3xl font-bold">
              Submit Trade - Day {currentDay}
            </h1>
            <p className="text-sm text-muted-foreground">
              Share your trade idea and analysis for Day {currentDay} of {activeCampaign.days_count}
            </p>
            <p className="text-xs text-muted-foreground">
              Campaign: {format(new Date(activeCampaign.start_date), 'MMM dd')} - {format(new Date(activeCampaign.end_date), 'MMM dd, yyyy')}
            </p>
          </div>

          {/* Campaign Rules Section */}
          {activeCampaign.rules && (
            <Alert className="bg-gradient-card border-primary/20">
              <Info className="h-5 w-5 text-primary" />
              <AlertTitle className="text-lg font-semibold">Campaign Rules</AlertTitle>
              <AlertDescription className="mt-2 text-muted-foreground whitespace-pre-wrap">
                {activeCampaign.rules}
              </AlertDescription>
            </Alert>
          )}

          {/* Submission Form */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Trade Idea */}
                <div className="space-y-2">
                  <Label htmlFor="trade-idea">Trade Idea *</Label>
                  <Textarea
                    id="trade-idea"
                    placeholder="Describe your trade setup, entry/exit points, and reasoning..."
                    value={formData.tradeIdea}
                    onChange={(e) =>
                      setFormData({ ...formData, tradeIdea: e.target.value })
                    }
                    rows={4}
                    required
                    className="resize-none bg-card"
                  />
                </div>

                {/* Twitter Link */}
                <div className="space-y-2">
                  <Label htmlFor="twitter-link">Twitter/X Link *</Label>
                  <Input
                    id="twitter-link"
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={formData.twitterLink}
                    onChange={(e) =>
                      setFormData({ ...formData, twitterLink: e.target.value })
                    }
                    className="bg-card"
                    required
                  />
                </div>

                {/* Twitter Screenshot Upload */}
                <div className="space-y-2">
                  <Label htmlFor="twitter-screenshot">Twitter Screenshot Proof *</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center bg-primary/10 hover:bg-primary/20 transition-colors">
                    <input
                      id="twitter-screenshot"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleTwitterScreenshotChange}
                      className="hidden"
                    />
                    <label htmlFor="twitter-screenshot" className="cursor-pointer">
                      <div className="space-y-2">
                        {twitterScreenshot ? (
                          <>
                            <CheckCircle className="h-10 w-10 text-success mx-auto" />
                            <p className="text-sm font-medium">{twitterScreenshot.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Click to change screenshot
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-primary mx-auto" />
                            <p className="text-sm font-medium">
                              Click to upload Twitter screenshot
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG up to 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Scorecard Confirmation Section */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      Scorecard Points (for scoring)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Confirm your Twitter post includes these for extra points
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="has-hashtag"
                        checked={formData.hasHashtag}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, hasHashtag: !!checked })
                        }
                      />
                      <label htmlFor="has-hashtag" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Hash className="h-4 w-4 text-primary" />
                        I used the correct hashtag (#7DaysTradingChallenge)
                        <span className="text-xs text-success font-medium">+2 pts</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="has-tagged"
                        checked={formData.hasTaggedAccount}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, hasTaggedAccount: !!checked })
                        }
                      />
                      <label htmlFor="has-tagged" className="flex items-center gap-2 text-sm cursor-pointer">
                        <AtSign className="h-4 w-4 text-primary" />
                        I tagged @propfirm_forex
                        <span className="text-xs text-success font-medium">+1 pt</span>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      📊 Chart upload = +1 pt | 📝 Trade analysis = +1 pt
                    </p>
                  </CardContent>
                </Card>

                {/* Market Pair */}
                <div className="space-y-2">
                  <Label htmlFor="market-pair">Market Pair (Optional)</Label>
                  <Input
                    id="market-pair"
                    type="text"
                    placeholder="e.g. BTC/USD, EUR/USD"
                    value={formData.marketPair}
                    onChange={(e) =>
                      setFormData({ ...formData, marketPair: e.target.value })
                    }
                    className="bg-card"
                  />
                </div>

                {/* Chart Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="chart-url">Chart Image URL (Optional)</Label>
                  <Input
                    id="chart-url"
                    type="url"
                    placeholder="https://..."
                    value={formData.chartImageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, chartImageUrl: e.target.value })
                    }
                    className="bg-card"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Submitting..." : "Submit Trade"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitTrade;