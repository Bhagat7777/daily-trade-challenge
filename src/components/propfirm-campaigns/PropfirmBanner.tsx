import React from 'react';
import { X, ExternalLink, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePropfirmCampaigns, PropfirmCampaign } from '@/hooks/usePropfirmCampaigns';

interface PropfirmBannerProps {
  location?: 'dashboard' | 'journal' | 'landing';
}

const PropfirmBanner: React.FC<PropfirmBannerProps> = ({ location = 'dashboard' }) => {
  const { topCampaign, loading, dismissCampaign, trackClick } = usePropfirmCampaigns(location);
  const { toast } = useToast();

  if (loading || !topCampaign) {
    return null;
  }

  const handleCtaClick = () => {
    trackClick(topCampaign.id, 'cta_button');
    window.open(topCampaign.cta_link, '_blank', 'noopener,noreferrer');
  };

  const handleBannerClick = (e: React.MouseEvent) => {
    // Don't track if clicking on buttons or close icon
    if ((e.target as HTMLElement).closest('button')) return;
    trackClick(topCampaign.id, 'banner_click');
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

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissCampaign(topCampaign.id);
  };

  return (
    <div 
      onClick={handleBannerClick}
      className="relative mb-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 shadow-md overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Logo + Content */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {topCampaign.logo_url && (
            <img 
              src={topCampaign.logo_url} 
              alt={topCampaign.prop_firm_name}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-contain bg-background/50 p-1 flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                Special Offer
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {topCampaign.title}
            </h3>
            {topCampaign.description && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {topCampaign.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Coupon + CTA + Close */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {topCampaign.coupon_code && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCoupon}
              className="flex-1 sm:flex-none bg-background/50 border-dashed border-primary/50 hover:bg-primary/10"
            >
              <Copy className="h-3 w-3 mr-1" />
              <span className="font-mono text-xs">{topCampaign.coupon_code}</span>
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleCtaClick}
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
          >
            {topCampaign.cta_text}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropfirmBanner;
