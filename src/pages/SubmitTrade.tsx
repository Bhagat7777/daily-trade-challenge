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
  const { submitTradeIdea, canSubmitToday, loading: journalLoading } = useTradingJournal();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tradeIdea: '',
    twitterLink: '',
    marketPair: '',
  });
  const [chartFile, setChartFile] = useState<File | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLoading(true);

    const { error } = await submitTradeIdea(
      formData.tradeIdea,
      formData.twitterLink,
      formData.marketPair,
      chartFile || undefined
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
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Submit Today's Trade Idea</h1>
              <p className="text-muted-foreground">
                Share your analysis and maintain your consistency streak
              </p>
            </div>
          </div>

          {/* Requirements Card */}
          <Card className="bg-gradient-card shadow-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Submission Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Post your trade idea on Twitter/X with #15DaysofTrading</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Tag @free_propfirm in your post</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Include a chart image in your Twitter post</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Paste the Twitter post link below</span>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Trade Submission Form</CardTitle>
              <CardDescription>
                Fill out all required fields to submit your daily trade idea
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trade Idea */}
                <div className="space-y-2">
                  <Label htmlFor="trade-idea">Trade Idea & Analysis *</Label>
                  <Textarea
                    id="trade-idea"
                    placeholder="Describe your trade setup, analysis, strategy, and reasoning..."
                    value={formData.tradeIdea}
                    onChange={(e) =>
                      setFormData({ ...formData, tradeIdea: e.target.value })
                    }
                    rows={6}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include your technical analysis, entry/exit strategy, and risk management
                  </p>
                </div>

                {/* Market Pair */}
                <div className="space-y-2">
                  <Label htmlFor="market-pair">Market Pair (Optional)</Label>
                  <Select
                    value={formData.marketPair}
                    onValueChange={(value) =>
                      setFormData({ ...formData, marketPair: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trading pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketPairs.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chart Upload */}
                <div className="space-y-2">
                  <Label htmlFor="chart-upload">Chart Image (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      id="chart-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="chart-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        {chartFile ? (
                          <>
                            <FileImage className="h-8 w-8 text-success mx-auto" />
                            <p className="text-sm font-medium">{chartFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Click to change file
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm font-medium">
                              Upload your chart image
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

                {/* Twitter Link */}
                <div className="space-y-2">
                  <Label htmlFor="twitter-link">Twitter Post Link *</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="twitter-link"
                      type="url"
                      placeholder="https://twitter.com/username/status/123456789"
                      value={formData.twitterLink}
                      onChange={(e) =>
                        setFormData({ ...formData, twitterLink: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link to your Twitter post with #15DaysofTrading and @free_propfirm
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:opacity-90 text-lg py-3"
                >
                  {loading ? "Submitting..." : "Submit Trade Idea"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitTrade;