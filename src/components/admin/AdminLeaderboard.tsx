import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  Star,
  Flame,
  Target,
  Eye,
  Download,
  Search,
  Copy,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Mail,
  Twitter,
  Radio,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLeaderboardProps {
  users: any[];
  activeCampaign: any;
  lastUpdate: Date;
  onViewSubmissions: (user: any) => void;
  onUpdateStatus: (userId: string, updates: any) => void;
  onExport: (data: any[], filename: string) => void;
}

const AdminLeaderboard: React.FC<AdminLeaderboardProps> = ({
  users,
  activeCampaign,
  lastUpdate,
  onViewSubmissions,
  onUpdateStatus,
  onExport
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  // Trigger animation when data updates
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 500);
    return () => clearTimeout(timer);
  }, [lastUpdate]);

  // Get campaign info
  const campaignDays = activeCampaign?.days_count || 15;
  const campaignStatus = activeCampaign?.status || 'upcoming';
  const isActive = campaignStatus === 'live';

  // Enhanced user data with leaderboard ranking
  const rankedUsers = useMemo(() => {
    return users
      .map(user => ({
        ...user,
        score: (user.total_submissions * 2) + user.current_streak + (user.completion_rate / 10),
        isWinner: user.total_submissions >= campaignDays && !user.is_disqualified
      }))
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [users, campaignDays]);

  // Filter users based on search
  const filteredUsers = rankedUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categorize users
  const winners = filteredUsers.filter(u => u.isWinner && !u.is_disqualified);
  const topPerformers = filteredUsers.slice(0, 10);
  const activeUsers = filteredUsers.filter(u => !u.is_disqualified && !u.is_challenge_completed);
  const completedUsers = filteredUsers.filter(u => u.is_challenge_completed);
  const disqualifiedUsers = filteredUsers.filter(u => u.is_disqualified);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-primary-foreground">🏆 #1</Badge>;
    if (rank === 2) return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-primary-foreground">🥈 #2</Badge>;
    if (rank === 3) return <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-primary-foreground">🥉 #3</Badge>;
    if (rank <= 10) return <Badge className="bg-gradient-primary text-primary-foreground">Top 10</Badge>;
    return <Badge variant="secondary">#{rank}</Badge>;
  };

  const getStatusBadge = (user: any) => {
    if (user.is_disqualified) return <Badge variant="destructive">Disqualified</Badge>;
    if (user.is_challenge_completed) return <Badge className="bg-gradient-success text-success-foreground">Completed</Badge>;
    if (user.isWinner) return <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-primary-foreground">Winner</Badge>;
    return <Badge variant="secondary">Active</Badge>;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = (action: string) => {
    const selectedUsersList = filteredUsers.filter(u => selectedUsers.has(u.id));
    
    switch (action) {
      case 'export':
        onExport(selectedUsersList, 'selected-users');
        break;
      case 'mark-completed':
        selectedUsersList.forEach(user => {
          onUpdateStatus(user.id, { is_challenge_completed: true });
        });
        setSelectedUsers(new Set());
        break;
      case 'disqualify':
        selectedUsersList.forEach(user => {
          onUpdateStatus(user.id, { is_disqualified: true });
        });
        setSelectedUsers(new Set());
        break;
    }
  };

  const LeaderboardTable = ({ users, showSelection = false }: { users: any[], showSelection?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && <TableHead className="w-12">Select</TableHead>}
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <motion.tr
              key={user.id}
              className={user.rank <= 3 ? "bg-gradient-to-r from-primary/5 to-success/5 border-b transition-colors hover:bg-muted/50" : "border-b transition-colors hover:bg-muted/50"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
            >
              {showSelection && (
                <TableCell>
                  <Switch
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => handleSelectUser(user.id)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2">
                  {getRankIcon(user.rank)}
                  {getRankBadge(user.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.username}</span>
                    {user.isWinner && <CheckCircle className="h-4 w-4 text-success" />}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="font-bold text-primary">{user.total_submissions}</div>
                    <div className="text-xs text-muted-foreground">Submissions</div>
                  </div>
                  <div>
                    <div className="font-bold text-success">{user.current_streak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div>
                    <div className="font-bold text-chart">{Math.round(user.completion_rate)}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{user.total_submissions}/{campaignDays} days</div>
                  <Progress value={(user.total_submissions / campaignDays) * 100} className="h-2 w-20" />
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(user)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewSubmissions(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.email, "Email")}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.username, "Username")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Campaign Status Alert */}
      {!isActive && (
        <Alert variant={campaignStatus === 'ended' ? 'default' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {campaignStatus === 'upcoming' && (
              <>
                <strong>Challenge Not Started Yet</strong> - The campaign will begin on{' '}
                {activeCampaign?.start_date ? new Date(activeCampaign.start_date).toLocaleDateString() : 'TBA'}
              </>
            )}
            {campaignStatus === 'ended' && (
              <>
                <strong>Challenge Completed</strong> - This campaign ended on{' '}
                {activeCampaign?.end_date ? new Date(activeCampaign.end_date).toLocaleDateString() : 'N/A'}.
                Leaderboard is now frozen.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Live Update Indicator */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Radio className="h-5 w-5 text-success" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-sm">Live Updating</h3>
              <p className="text-xs text-muted-foreground">
                Leaderboard updates automatically when traders submit or verify trades
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-background">
            {activeCampaign?.title || 'Active Campaign'}
          </Badge>
        </motion.div>
      )}

      {/* Header with Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {selectedUsers.size > 0 && (
          <div className="flex gap-2">
            <Badge variant="outline">{selectedUsers.size} selected</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('mark-completed')}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('disqualify')}
            >
              <UserX className="h-4 w-4 mr-1" />
              Disqualify
            </Button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{winners.length}</div>
            <div className="text-sm text-muted-foreground">Winners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{activeUsers.length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-chart">{completedUsers.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{disqualifiedUsers.length}</div>
            <div className="text-sm text-muted-foreground">Disqualified</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="winners">Winners ({winners.length})</TabsTrigger>
          <TabsTrigger value="top10">Top 10</TabsTrigger>
          <TabsTrigger value="active">Active ({activeUsers.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users - Ranked by Performance</CardTitle>
              <CardDescription>
                Users ranked by overall performance score (submissions + streaks + completion rate)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable users={filteredUsers} showSelection={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-success" />
                Challenge Winners
              </CardTitle>
              <CardDescription>
                Users who completed all {campaignDays} days of the challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {winners.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No winners yet</p>
                </div>
              ) : (
                <LeaderboardTable users={winners} showSelection={true} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top 10 Performers
              </CardTitle>
              <CardDescription>
                Highest ranked users by overall performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable users={topPerformers} showSelection={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Participants</CardTitle>
              <CardDescription>
                Users currently participating in the challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable users={activeUsers} showSelection={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Completed Users
              </CardTitle>
              <CardDescription>
                Users marked as completed by admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable users={completedUsers} showSelection={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLeaderboard;