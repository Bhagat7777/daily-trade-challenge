import React from 'react';
import { ExternalLink, Copy, Gift, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePropfirmCampaigns } from '@/hooks/usePropfirmCampaigns';

interface PropfirmPromoCardProps {
  location?: 'dashboard' | 'journal' | 'landing';
}

const PropfirmPromoCard: React.FC<PropfirmPromoCardProps> = ({ location = 'journal' }) => {
  const { topCampaign, loading, dismissCampaign, trackClick } = usePropfirmCampaigns(location);
  const { toast } = useToast();

  if (loading || !topCampaign) {
    return null;
  }

  const handleCtaClick = () => {
    trackClick(topCampaign.id, 'cta_button');
    window.open(topCampaign.cta_link, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCoupon = () => {
    if (topCampaign.coupon_code) {
      navigator.clipboard.writeText(topCampaign.coupon_code);
      trackClick(topCampaign.id, 'copy_coupon');
      toast({
        title: 'Coupon Copied!',
        description: `${topCampaign.coupon_code} has been copied to your clipboard`,
      });
    }
  };

  const handleDismiss = () => {
    dismissCampaign(topCampaign.id);
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground z-10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {topCampaign.logo_url ? (
            <img 
              src={topCampaign.logo_url} 
              alt={topCampaign.prop_firm_name}
              className="h-12 w-12 rounded-lg object-contain bg-background/50 p-1"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Gift className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className="mb-1 text-xs bg-primary/10 text-primary border-0">
              Special Offer
            </Badge>
            <h3 className="font-semibold text-sm truncate">
              {topCampaign.prop_firm_name}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            {topCampaign.title}
          </p>
          {topCampaign.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {topCampaign.description}
            </p>
          )}
        </div>

        {topCampaign.coupon_code && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-dashed border-primary/30">
            <span className="text-xs text-muted-foreground">Code:</span>
            <code className="flex-1 font-mono text-sm font-semibold text-primary">
              {topCampaign.coupon_code}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCoupon}
              className="h-7 px-2 hover:bg-primary/10"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleCtaClick}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
        >
          {topCampaign.cta_text}
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropfirmPromoCard;
