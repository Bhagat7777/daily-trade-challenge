import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Campaign } from "@/hooks/useCampaignManagement";
import { Upload, Loader2 } from "lucide-react";

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSubmit: (data: Partial<Campaign>) => Promise<void>;
  onCancel: () => void;
  onUploadBanner: (file: File) => Promise<string>;
}

export const CampaignForm = ({ campaign, onSubmit, onCancel, onUploadBanner }: CampaignFormProps) => {
  const [formData, setFormData] = useState<Partial<Campaign>>({
    title: '',
    description: '',
    type: 'trading_challenge',
    start_date: '',
    end_date: '',
    days_count: 15,
    banner_url: '',
    rules: '',
    rewards: {},
    status: 'upcoming',
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string>('');

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
      setBannerPreview(campaign.banner_url || '');
    }
  }, [campaign]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await onUploadBanner(file);
      setFormData(prev => ({ ...prev, banner_url: url }));
      setBannerPreview(url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</CardTitle>
          <CardDescription>
            {campaign ? 'Update campaign details' : 'Fill in the details to create a new campaign'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Name *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter campaign description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trading_challenge">Trading Challenge</SelectItem>
                  <SelectItem value="payout_contest">Payout Contest</SelectItem>
                  <SelectItem value="giveaway">Giveaway</SelectItem>
                  <SelectItem value="streak_challenge">Streak Challenge</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days_count">Days Count *</Label>
              <Input
                id="days_count"
                type="number"
                value={formData.days_count}
                onChange={(e) => setFormData(prev => ({ ...prev, days_count: parseInt(e.target.value) }))}
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner">Campaign Banner</Label>
            <div className="flex items-center gap-4">
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {bannerPreview && (
              <div className="mt-2">
                <img src={bannerPreview} alt="Banner preview" className="h-32 w-full object-cover rounded-lg" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Rules & Guidelines</Label>
            <Textarea
              id="rules"
              value={formData.rules || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
              placeholder="Enter campaign rules and guidelines"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rewards">Reward Details</Label>
            <Textarea
              id="rewards"
              value={typeof formData.rewards === 'string' ? formData.rewards : JSON.stringify(formData.rewards || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, rewards: parsed }));
                } catch {
                  setFormData(prev => ({ ...prev, rewards: e.target.value }));
                }
              }}
              placeholder='{"first_place": "1000 USDT", "second_place": "500 USDT"}'
              rows={3}
            />
          </div>

          {campaign && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            campaign ? 'Update Campaign' : 'Create Campaign'
          )}
        </Button>
      </div>
    </form>
  );
};
