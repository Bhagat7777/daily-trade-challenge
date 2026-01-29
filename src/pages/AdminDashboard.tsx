import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import AdminLeaderboard from '@/components/admin/AdminLeaderboard';
import AdminScorecardLeaderboard from '@/components/admin/AdminScorecardLeaderboard';
import { ProofVerification } from '@/components/admin/ProofVerification';
import {
  AlertTriangle,
  CheckCircle, 
  XCircle, 
  Eye, 
  UserCheck, 
  UserX, 
  Download,
  Search,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Trophy,
  Megaphone,
  ClipboardList,
  Award
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { CampaignManagement } from '@/components/admin/CampaignManagement';
import { PendingVerifications } from '@/components/admin/PendingVerifications';
import { CampaignSubmissions } from '@/components/admin/CampaignSubmissions';

const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    users,
    submissions,
    loading,
    submissionsLoading,
    activeCampaign,
    lastUpdate,
    fetchUserSubmissions,
    updateUserStatus,
    updateSubmissionRule,
    exportToCSV,
    checkAdminStatus,
  } = useAdminDashboard();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    checkAdminStatus().then(setIsAdmin);
  }, [user]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate users by status
  const activeUsers = filteredUsers.filter(u => !u.is_disqualified && !u.is_challenge_completed);
  const completedUsers = filteredUsers.filter(u => u.is_challenge_completed);
  const disqualifiedUsers = filteredUsers.filter(u => u.is_disqualified);

  const handleViewSubmissions = async (user: any) => {
    setSelectedUser(user);
    setAdminNotes(user.admin_notes || '');
    await fetchUserSubmissions(user.id);
    setShowSubmissionsModal(true);
  };

  const handleUpdateStatus = async (userId: string, updates: any) => {
    await updateUserStatus(userId, updates);
    setShowSubmissionsModal(false);
  };

  const handleExportCompleted = () => {
    exportToCSV(completedUsers, 'completed-users');
  };

  const handleExportDisqualified = () => {
    exportToCSV(disqualifiedUsers, 'disqualified-users');
  };

  const handleExportAll = () => {
    exportToCSV(filteredUsers, 'all-users');
  };

  // Generate calendar data for submissions view
  const getSubmissionCalendar = () => {
    if (!activeCampaign) return [];

    const calendar = [];
    const campaignDays = activeCampaign.days_count || 15;
    
    // Use UTC to avoid timezone issues. Supabase date strings are like '2025-11-05' which are parsed as UTC midnight.
    const campaignStartDate = new Date(activeCampaign.start_date + 'T00:00:00Z');

    for (let day = 1; day <= campaignDays; day++) {
      const expectedDate = new Date(campaignStartDate);
      expectedDate.setUTCDate(campaignStartDate.getUTCDate() + day - 1);
      const expectedDateString = expectedDate.toISOString().split('T')[0];

      const submission = submissions.find(s => s.submission_date === expectedDateString);
      
      calendar.push({
        day,
        submission,
        hasSubmission: !!submission,
      });
    }
    return calendar;
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You don't have admin privileges.</p>
          </div>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">15 Days Trading Journal Challenge</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={handleExportAll} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export </span>All
            </Button>
            <Button onClick={handleExportCompleted} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export </span>Completed
            </Button>
            <Button onClick={handleExportDisqualified} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export </span>Disqualified
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disqualified</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{disqualifiedUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="verifications" className="text-xs sm:text-sm flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verify
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs sm:text-sm flex items-center gap-1">
              <ClipboardList className="h-3 w-3" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="scorecard" className="text-xs sm:text-sm flex items-center gap-1">
              <Award className="h-3 w-3" />
              Scorecard
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs sm:text-sm flex items-center gap-1">
              <Megaphone className="h-3 w-3" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">All ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active ({activeUsers.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed ({completedUsers.length})</TabsTrigger>
            <TabsTrigger value="disqualified" className="text-xs sm:text-sm">Disqualified ({disqualifiedUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <PendingVerifications />
          </TabsContent>

          <TabsContent value="submissions">
            <CampaignSubmissions />
          </TabsContent>

          <TabsContent value="scorecard">
            <AdminScorecardLeaderboard campaignId={activeCampaign?.id} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <AdminLeaderboard
              users={filteredUsers}
              activeCampaign={activeCampaign}
              lastUpdate={lastUpdate}
              onViewSubmissions={handleViewSubmissions}
              onUpdateStatus={updateUserStatus}
              onExport={exportToCSV}
            />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignManagement />
          </TabsContent>

          <TabsContent value="all">
            <UserTable users={filteredUsers} onViewSubmissions={handleViewSubmissions} />
          </TabsContent>
          
          <TabsContent value="active">
            <UserTable users={activeUsers} onViewSubmissions={handleViewSubmissions} />
          </TabsContent>
          
          <TabsContent value="completed">
            <UserTable users={completedUsers} onViewSubmissions={handleViewSubmissions} />
          </TabsContent>
          
          <TabsContent value="disqualified">
            <UserTable users={disqualifiedUsers} onViewSubmissions={handleViewSubmissions} />
          </TabsContent>
        </Tabs>

        {/* Submissions Modal */}
        <Dialog open={showSubmissionsModal} onOpenChange={setShowSubmissionsModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.username}'s Submissions
              </DialogTitle>
              <DialogDescription>
                Review daily submissions and manage user status
              </DialogDescription>
            </DialogHeader>

            {submissionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Status Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleUpdateStatus(selectedUser?.id, { 
                          is_challenge_completed: !selectedUser?.is_challenge_completed 
                        })}
                        variant={selectedUser?.is_challenge_completed ? "default" : "outline"}
                        className="flex items-center gap-2"
                      >
                        <UserCheck className="h-4 w-4" />
                        {selectedUser?.is_challenge_completed ? 'Completed' : 'Mark Completed'}
                      </Button>
                      
                      <Button
                        onClick={() => handleUpdateStatus(selectedUser?.id, { 
                          is_disqualified: !selectedUser?.is_disqualified 
                        })}
                        variant={selectedUser?.is_disqualified ? "destructive" : "outline"}
                        className="flex items-center gap-2"
                      >
                        <UserX className="h-4 w-4" />
                        {selectedUser?.is_disqualified ? 'Disqualified' : 'Disqualify'}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-notes">Admin Notes</Label>
                      <Textarea
                        id="admin-notes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this user..."
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={() => handleUpdateStatus(selectedUser?.id, { admin_notes: adminNotes })}
                        size="sm"
                      >
                        Save Notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Submissions Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Daily Submissions ({activeCampaign?.days_count || 15} Days)
                    </CardTitle>
                    <CardDescription>
                      Campaign: {activeCampaign?.title || 'No Active Campaign'} | 
                      Total Submissions: {submissions.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getSubmissionCalendar().map(({ day, submission, hasSubmission }) => (
                        <Card key={day} className={`p-4 ${hasSubmission ? 'border-green-200' : 'border-red-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={hasSubmission ? "default" : "secondary"}>
                              Day {day}
                            </Badge>
                            {hasSubmission && (
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`rule-${submission.id}`} className="text-xs">
                                  Rule Followed
                                </Label>
                                <Switch
                                  id={`rule-${submission.id}`}
                                  checked={submission.rule_followed}
                                  onCheckedChange={(checked) => 
                                    updateSubmissionRule(submission.id, checked)
                                  }
                                />
                              </div>
                            )}
                          </div>
                          
                           {hasSubmission ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  {new Date(submission.submission_date).toLocaleDateString()}
                                </p>
                                {submission.verification_status === 'verified' && (
                                  <Badge className="bg-green-500 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                {submission.verification_status === 'rejected' && (
                                  <Badge variant="destructive" className="text-xs">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Rejected
                                  </Badge>
                                )}
                                {submission.verification_status === 'pending' && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>

                              <ProofVerification
                                submission={submission}
                                onVerificationComplete={() => fetchUserSubmissions(selectedUser?.id)}
                              />
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                              <p className="text-xs text-muted-foreground">No submission</p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// User Table Component
const UserTable = ({ users, onViewSubmissions }: { users: any[], onViewSubmissions: (user: any) => void }) => {
  return (
    <Card>
      <CardContent className="p-0">
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4 p-4">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <Button
                    onClick={() => onViewSubmissions(user)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submissions:</span>
                    <Badge variant="outline" className="ml-2">
                      {user.total_submissions}/15
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Streak:</span>
                    <Badge variant={user.current_streak > 0 ? "default" : "secondary"} className="ml-2">
                      {user.current_streak} days
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completion:</span>
                    <Badge variant={user.completion_rate >= 80 ? "default" : "secondary"} className="ml-2">
                      {user.completion_rate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <div className="ml-2">
                      {user.is_challenge_completed && (
                        <Badge variant="default" className="bg-green-600">
                          Completed
                        </Badge>
                      )}
                      {user.is_disqualified && (
                        <Badge variant="destructive">
                          Disqualified
                        </Badge>
                      )}
                      {!user.is_challenge_completed && !user.is_disqualified && (
                        <Badge variant="secondary">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Last Submit: {user.last_submission_date 
                    ? new Date(user.last_submission_date).toLocaleDateString()
                    : 'Never'
                  }
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Last Submit</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">{user.full_name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.total_submissions}/15
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.current_streak > 0 ? "default" : "secondary"}>
                      {user.current_streak} days
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.last_submission_date 
                      ? new Date(user.last_submission_date).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.completion_rate >= 80 ? "default" : "secondary"}>
                      {user.completion_rate}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.is_challenge_completed && (
                        <Badge variant="default" className="bg-green-600">
                          Completed
                        </Badge>
                      )}
                      {user.is_disqualified && (
                        <Badge variant="destructive">
                          Disqualified
                        </Badge>
                      )}
                      {!user.is_challenge_completed && !user.is_disqualified && (
                        <Badge variant="secondary">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => onViewSubmissions(user)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;