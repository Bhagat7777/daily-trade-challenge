import React, { useState } from 'react';
import { usePropfirmCampaignAdmin, PropfirmCampaign } from '@/hooks/usePropfirmCampaignAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Download, ExternalLink, MousePointer, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import PropfirmCampaignForm from './PropfirmCampaignForm';

const PropfirmCampaignAdmin: React.FC = () => {
  const {
    campaigns,
    stats,
    loading,
    createCampaign,
    updateCampaign,
    toggleEnabled,
    deleteCampaign,
    getCampaignStatus,
    exportStatsToCSV,
  } = usePropfirmCampaignAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PropfirmCampaign | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingCampaign(null);
    setFormOpen(true);
  };

  const handleEdit = (campaign: PropfirmCampaign) => {
    setEditingCampaign(campaign);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingCampaign) {
      return await updateCampaign(editingCampaign.id, data);
    }
    return await createCampaign(data);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteCampaign(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const getStatusBadge = (campaign: PropfirmCampaign) => {
    const status = getCampaignStatus(campaign);
    switch (status) {
      case 'live':
        return <Badge className="bg-success text-success-foreground">Live</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'ended':
        return <Badge variant="outline" className="text-muted-foreground">Ended</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">PropFirm Campaigns</h2>
          <p className="text-muted-foreground">
            Manage promotional campaigns for prop firms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportStatsToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export Stats
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {campaigns.filter(c => getCampaignStatus(c) === 'live' && c.is_enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(stats.values()).reduce((sum, s) => sum + s.total_clicks, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CTA Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(stats.values()).reduce((sum, s) => sum + s.cta_clicks, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Click on a campaign to edit its details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No campaigns yet. Create your first one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Prop Firm</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead className="text-center">Enabled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const campaignStats = stats.get(campaign.id);
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>{getStatusBadge(campaign)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.title}</p>
                            {campaign.coupon_code && (
                              <code className="text-xs text-primary">{campaign.coupon_code}</code>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {campaign.logo_url && (
                              <img 
                                src={campaign.logo_url} 
                                alt="" 
                                className="h-6 w-6 rounded object-contain"
                              />
                            )}
                            {campaign.prop_firm_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(campaign.start_time), 'MMM d, yyyy HH:mm')}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(campaign.end_time), 'MMM d, yyyy HH:mm')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MousePointer className="h-3 w-3 text-muted-foreground" />
                            <span>{campaignStats?.cta_clicks || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={campaign.is_enabled}
                            onCheckedChange={(checked) => toggleEnabled(campaign.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(campaign.cta_link, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(campaign)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirm(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <PropfirmCampaignForm
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editingCampaign}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
              All click tracking data will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropfirmCampaignAdmin;
