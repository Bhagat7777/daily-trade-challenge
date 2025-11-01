import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTradingJournal } from '@/hooks/useTradingJournal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Twitter, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  FileImage
} from 'lucide-react';

const SubmitTrade = () => {
  const { user } = useAuth();
  const { submitTradeIdea, canSubmitToday, userStats, loading: journalLoading } = useTradingJournal();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tradeIdea: '',
    twitterLink: '',
    marketPair: '',
    chartImageUrl: '',
  });
  const [chartFile, setChartFile] = useState<File | null>(null);
  const [twitterScreenshot, setTwitterScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const marketPairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'EURAUD', 'GBPAUD', 'NZDJPY',
    'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD', 'US30', 'US500', 'NAS100'
  ];

  if (journalLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading submission form...</p>
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
      twitterScreenshot
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
            <h1 className="text-2xl font-bold">
              Submit Trade - Day {userStats ? userStats.total_submissions + 1 : 1}
            </h1>
            <p className="text-sm text-muted-foreground">
              Share your trade idea and analysis for today
            </p>
          </div>

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