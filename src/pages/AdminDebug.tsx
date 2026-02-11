import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, CheckCircle, XCircle } from 'lucide-react';

const AdminDebug = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
    if (error) console.error('Profile fetch error:', error.message);
  };

  const navigateToAdmin = () => {
    window.location.href = '/admin-dashboard';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Admin Debug Panel</h1>
          <p className="text-muted-foreground">View admin authentication status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <p className="text-sm text-muted-foreground font-mono">
                  {user?.id || 'Not logged in'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'Not logged in'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Auth Status</label>
              <div className="mt-1">
                {user ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Authenticated
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Authenticated
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-sm text-muted-foreground">{profile.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <div className="mt-1">
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role || 'user'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Admin Status</label>
                  <div className="mt-1">
                    {profile.role === 'admin' ? (
                      <Badge variant="default" className="bg-orange-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin Access
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Regular User
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No profile found</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={checkProfile} variant="outline">
            Refresh Profile
          </Button>
          
          {profile?.role === 'admin' && (
            <Button onClick={navigateToAdmin} variant="default" className="bg-orange-600 hover:bg-orange-700">
              <Shield className="h-4 w-4 mr-2" />
              Go to Admin Dashboard
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To set up an admin user, use the Supabase Dashboard directly:
            </p>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Update the user's profile role to 'admin'</li>
              <li>Click "Refresh Profile" to verify admin role</li>
              <li>Use "Go to Admin Dashboard" if admin role is confirmed</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDebug;
