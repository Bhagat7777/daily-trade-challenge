import { useCampaignManagement } from "@/hooks/useCampaignManagement";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Campaigns = () => {
  const { campaigns, loading } = useCampaignManagement();

  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const upcomingCampaigns = campaigns.filter(c => c.status === 'upcoming');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trading Campaigns
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join exciting trading challenges, compete with traders worldwide, and win amazing rewards
          </p>
        </motion.div>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="live" className="gap-2">
              <Trophy className="h-4 w-4" />
              Live Campaigns ({liveCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming ({upcomingCampaigns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {liveCampaigns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Live Campaigns</h3>
                <p className="text-muted-foreground">
                  Check back soon for new trading challenges!
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveCampaigns.map((campaign, index) => (
                  <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingCampaigns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Upcoming Campaigns</h3>
                <p className="text-muted-foreground">
                  Stay tuned for announcements about future campaigns!
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCampaigns.map((campaign, index) => (
                  <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campaigns;
