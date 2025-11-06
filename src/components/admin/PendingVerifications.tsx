import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ProofVerification } from './ProofVerification';
import { Clock, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PendingVerifications = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    
    try {
      // First get submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('trade_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      // Then get profiles for each submission
      if (submissionsData && submissionsData.length > 0) {
        const userIds = [...new Set(submissionsData.map(s => s.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Map profiles to submissions
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const enrichedSubmissions = submissionsData.map(sub => ({
          ...sub,
          profiles: profilesMap.get(sub.user_id) || null
        }));

        setSubmissions(enrichedSubmissions);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();

    // Subscribe to changes
    const channel = supabase
      .channel('verification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trade_submissions',
        },
        () => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pendingSubmissions = submissions.filter(s => s.verification_status === 'pending');
  const verifiedSubmissions = submissions.filter(s => s.verification_status === 'verified');
  const rejectedSubmissions = submissions.filter(s => s.verification_status === 'rejected');

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <CheckCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedSubmissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verifiedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending verifications
              </CardContent>
            </Card>
          ) : (
            pendingSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {submission.profiles?.username || 'Unknown User'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Day {submission.day_number || 'N/A'} • {new Date(submission.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProofVerification
                    submission={submission}
                    onVerificationComplete={fetchSubmissions}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4 mt-4">
          {verifiedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No verified submissions yet
              </CardContent>
            </Card>
          ) : (
            verifiedSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {submission.profiles?.username || 'Unknown User'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Day {submission.day_number || 'N/A'} • {new Date(submission.verified_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProofVerification
                    submission={submission}
                    onVerificationComplete={fetchSubmissions}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejectedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No rejected submissions
              </CardContent>
            </Card>
          ) : (
            rejectedSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {submission.profiles?.username || 'Unknown User'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Day {submission.day_number || 'N/A'} • {new Date(submission.verified_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      Rejected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProofVerification
                    submission={submission}
                    onVerificationComplete={fetchSubmissions}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
