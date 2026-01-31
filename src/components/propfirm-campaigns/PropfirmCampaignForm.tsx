import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PropfirmCampaign, CreateCampaignData } from '@/hooks/usePropfirmCampaignAdmin';
import { format } from 'date-fns';

interface PropfirmCampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: PropfirmCampaign | null;
  onSubmit: (data: CreateCampaignData) => Promise<boolean>;
}

const DISPLAY_LOCATIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'journal', label: 'Journal (Submit Trade)' },
  { value: 'landing', label: 'Landing Page' },
];

const PropfirmCampaignForm: React.FC<PropfirmCampaignFormProps> = ({
  open,
  onOpenChange,
  campaign,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignData>({
    title: '',
    description: '',
    prop_firm_name: '',
    logo_url: '',
    banner_image_url: '',
    cta_text: 'Get Started',
    cta_link: '',
    coupon_code: '',
    start_time: '',
    end_time: '',
    priority: 0,
    is_enabled: true,
    display_locations: ['dashboard'],
    campaign_type: 'banner',
  });

  // Populate form when editing
  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description || '',
        prop_firm_name: campaign.prop_firm_name,
        logo_url: campaign.logo_url || '',
        banner_image_url: campaign.banner_image_url || '',
        cta_text: campaign.cta_text,
        cta_link: campaign.cta_link,
        coupon_code: campaign.coupon_code || '',
        start_time: campaign.start_time ? format(new Date(campaign.start_time), "yyyy-MM-dd'T'HH:mm") : '',
        end_time: campaign.end_time ? format(new Date(campaign.end_time), "yyyy-MM-dd'T'HH:mm") : '',
        priority: campaign.priority,
        is_enabled: campaign.is_enabled,
        display_locations: campaign.display_locations || ['dashboard'],
        campaign_type: campaign.campaign_type,
      });
    } else {
      // Reset form for new campaign
      setFormData({
        title: '',
        description: '',
        prop_firm_name: '',
        logo_url: '',
        banner_image_url: '',
        cta_text: 'Get Started',
        cta_link: '',
        coupon_code: '',
        start_time: '',
        end_time: '',
        priority: 0,
        is_enabled: true,
        display_locations: ['dashboard'],
        campaign_type: 'banner',
      });
    }
  }, [campaign, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await onSubmit({
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
    });

    setLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const toggleLocation = (location: string) => {
    const current = formData.display_locations || [];
    if (current.includes(location)) {
      setFormData({
        ...formData,
        display_locations: current.filter(l => l !== location),
      });
    } else {
      setFormData({
        ...formData,
        display_locations: [...current, location],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Edit PropFirm Campaign' : 'Create PropFirm Campaign'}
          </DialogTitle>
          <DialogDescription>
            {campaign 
              ? 'Update the campaign details below' 
              : 'Create a promotional campaign for a prop firm'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., FTMO 20% Off Challenge"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop_firm_name">Prop Firm Name *</Label>
              <Input
                id="prop_firm_name"
                value={formData.prop_firm_name}
                onChange={(e) => setFormData({ ...formData, prop_firm_name: e.target.value })}
                placeholder="e.g., FTMO"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the offer..."
              rows={2}
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_image_url">Banner Image URL</Label>
              <Input
                id="banner_image_url"
                type="url"
                value={formData.banner_image_url}
                onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* CTA & Coupon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_text">Button Text</Label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                placeholder="Get Started"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_link">Affiliate Link *</Label>
              <Input
                id="cta_link"
                type="url"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon_code">Coupon Code</Label>
              <Input
                id="coupon_code"
                value={formData.coupon_code}
                onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                placeholder="e.g., TRADE20"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Date & Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Date & Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (higher = shown first)</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_type">Campaign Type</Label>
              <Select
                value={formData.campaign_type}
                onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Display Locations */}
          <div className="space-y-3">
            <Label>Display Locations</Label>
            <div className="flex flex-wrap gap-4">
              {DISPLAY_LOCATIONS.map((loc) => (
                <div key={loc.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`loc-${loc.value}`}
                    checked={formData.display_locations?.includes(loc.value)}
                    onCheckedChange={() => toggleLocation(loc.value)}
                  />
                  <label htmlFor={`loc-${loc.value}`} className="text-sm cursor-pointer">
                    {loc.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_enabled"
              checked={formData.is_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: !!checked })}
            />
            <label htmlFor="is_enabled" className="text-sm cursor-pointer">
              Campaign is enabled (will show when active)
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropfirmCampaignForm;
