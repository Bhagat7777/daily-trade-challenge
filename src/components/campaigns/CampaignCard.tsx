import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@/hooks/useCampaignManagement";
import { CountdownTimer } from "./CountdownTimer";
import { Calendar, Trophy, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

export const CampaignCard = ({ campaign, index }: CampaignCardProps) => {
  const navigate = useNavigate();

  const getStatusInfo = () => {
    switch (campaign.status) {
      case 'live':
        return {
          badge: <Badge className="bg-green-500">Live Now</Badge>,
          button: { text: 'Join Now', variant: 'default' as const },
          showEndCountdown: true,
        };
      case 'upcoming':
        return {
          badge: <Badge variant="secondary">Coming Soon</Badge>,
          button: { text: 'Notify Me', variant: 'outline' as const },
          showStartCountdown: true,
        };
      case 'ended':
        return {
          badge: <Badge variant="outline">Ended</Badge>,
          button: { text: 'View Results', variant: 'outline' as const },
          showEndCountdown: false,
        };
      default:
        return {
          badge: <Badge>Unknown</Badge>,
          button: { text: 'Learn More', variant: 'outline' as const },
          showEndCountdown: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
        {campaign.banner_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={campaign.banner_url}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              {statusInfo.badge}
            </div>
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{campaign.title}</CardTitle>
              <CardDescription className="mt-2">
                {campaign.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(campaign.start_date), 'MMM dd')} - {format(new Date(campaign.end_date), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{campaign.days_count} days</span>
            </div>

            {statusInfo.showStartCountdown && (
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Starts in:</p>
                <CountdownTimer targetDate={campaign.start_date} />
              </div>
            )}

            {statusInfo.showEndCountdown && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Ends in:</p>
                <CountdownTimer targetDate={campaign.end_date} />
              </div>
            )}
          </div>

          <Button 
            className="w-full" 
            variant={statusInfo.button.variant}
            onClick={() => {
              if (campaign.status === 'live') {
                navigate(`/submit/${campaign.id}`);
              }
            }}
          >
            {statusInfo.button.text}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};