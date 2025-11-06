import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Image as ImageIcon,
  FileImage
} from 'lucide-react';

interface ProofVerificationProps {
  submission: any;
  onVerificationComplete: () => void;
}

export const ProofVerification = ({ submission, onVerificationComplete }: ProofVerificationProps) => {
  const { toast } = useToast();
  const [comment, setComment] = useState(submission.admin_comment || '');
  const [loading, setLoading] = useState(false);

  // Get proper public URLs for images
  const twitterScreenshotUrl = useMemo(() => {
    if (!submission.twitter_screenshot_url) return null;
    
    // If it's already a full URL, return it
    if (submission.twitter_screenshot_url.startsWith('http')) {
      return submission.twitter_screenshot_url;
    }
    
    // Otherwise, construct Supabase storage URL
    const { data } = supabase.storage
      .from('twitter-screenshots')
      .getPublicUrl(submission.twitter_screenshot_url);
    
    return data?.publicUrl || submission.twitter_screenshot_url;
  }, [submission.twitter_screenshot_url]);

  const chartImageUrl = useMemo(() => {
    if (!submission.chart_image_url) return null;
    
    // If it's already a full URL, return it
    if (submission.chart_image_url.startsWith('http')) {
      return submission.chart_image_url;
    }
    
    // Otherwise, construct Supabase storage URL
    const { data } = supabase.storage
      .from('trade-charts')
      .getPublicUrl(submission.chart_image_url);
    
    return data?.publicUrl || submission.chart_image_url;
  }, [submission.chart_image_url]);

  const handleVerify = async (status: 'verified' | 'rejected') => {
    setLoading(true);

    const { error } = await supabase
      .from('trade_submissions')
      .update({
        verification_status: status,
        verified_at: new Date().toISOString(),
        verifier_id: (await supabase.auth.getUser()).data.user?.id,
        admin_comment: comment || null,
      })
      .eq('id', submission.id);

    if (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Submission ${status}`,
      });
      onVerificationComplete();
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Proof Verification</CardTitle>
          {getStatusBadge(submission.verification_status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Twitter Screenshot */}
        {twitterScreenshotUrl ? (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Twitter Screenshot Proof
            </Label>
            <div className="relative group rounded-lg overflow-hidden border-2 border-primary/20">
              <img 
                src={twitterScreenshotUrl} 
                alt="Twitter Screenshot" 
                className="w-full object-contain max-h-96 cursor-pointer hover:opacity-90 transition-opacity bg-muted"
                onClick={() => window.open(twitterScreenshotUrl, '_blank')}
                onError={(e) => {
                  console.error('Failed to load Twitter screenshot:', twitterScreenshotUrl);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" variant="secondary">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Twitter Screenshot Proof</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No screenshot uploaded</p>
            </div>
          </div>
        )}

        {/* Twitter Link */}
        <div className="space-y-2">
          <Label>Twitter Post Link</Label>
          <a 
            href={submission.twitter_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View Original Tweet
          </a>
        </div>

        {/* Chart Image */}
        {chartImageUrl ? (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Chart Image
            </Label>
            <div className="rounded-lg overflow-hidden border-2 border-border">
              <img 
                src={chartImageUrl} 
                alt="Chart" 
                className="w-full object-contain max-h-96 cursor-pointer hover:opacity-90 transition-opacity bg-muted"
                onClick={() => window.open(chartImageUrl, '_blank')}
                onError={(e) => {
                  console.error('Failed to load chart image:', chartImageUrl);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EChart Error%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
        ) : null}

        {/* Trade Details */}
        <div className="space-y-2">
          <Label>Trade Idea</Label>
          <p className="text-sm bg-muted p-3 rounded-lg">{submission.trade_idea}</p>
        </div>

        {submission.market_pair && (
          <div className="space-y-2">
            <Label>Market Pair</Label>
            <Badge variant="outline">{submission.market_pair}</Badge>
          </div>
        )}

        {/* Admin Comment */}
        <div className="space-y-2">
          <Label htmlFor="admin-comment">Admin Comment (Optional)</Label>
          <Textarea
            id="admin-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add notes about this submission..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        {submission.verification_status === 'pending' && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => handleVerify('rejected')}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleVerify('verified')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </div>
        )}

        {submission.verification_status !== 'pending' && (
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium">
              {submission.verification_status === 'verified' ? 'Verified' : 'Rejected'} on{' '}
              {new Date(submission.verified_at).toLocaleDateString()}
            </p>
            {submission.admin_comment && (
              <p className="text-muted-foreground mt-1">{submission.admin_comment}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
