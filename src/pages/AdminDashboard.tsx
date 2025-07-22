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
import { 
  AlertTriangle,
  CheckCircle, 
  XCircle, 
  Eye, 
  UserCheck, 
  UserX, 
  Download,
  Search,
  Calendar,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    users,
    submissions,
    loading,
    submissionsLoading,
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
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    const calendar = [];
    for (let day = 1; day <= 15; day++) {
      const submission = submissions.find(s => s.day_number === day);
      calendar.push({
        day,
        submission,
        hasSubmission: !!submission,
      });
    }
    return calendar;
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">15 Days Trading Journal Challenge</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleExportAll} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button onClick={handleExportCompleted} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Completed
            </Button>
            <Button onClick={handleExportDisqualified} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Disqualified
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
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeUsers.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedUsers.length})</TabsTrigger>
            <TabsTrigger value="disqualified">Disqualified ({disqualifiedUsers.length})</TabsTrigger>
          </TabsList>

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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                    <div className="grid grid-cols-2 gap-4">
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
                    <CardTitle className="text-lg">Daily Submissions (15 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                {new Date(submission.submission_date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {submission.trade_idea}
                              </p>
                              {submission.chart_image_url && (
                                <img 
                                  src={submission.chart_image_url} 
                                  alt="Chart" 
                                  className="w-full h-20 object-cover rounded"
                                />
                              )}
                              <a 
                                href={submission.twitter_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline block"
                              >
                                View Tweet
                              </a>
                              {submission.market_pair && (
                                <Badge variant="outline" className="text-xs">
                                  {submission.market_pair}
                                </Badge>
                              )}
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
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;