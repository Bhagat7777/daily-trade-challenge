import { supabase } from '@/integrations/supabase/client';

export const ensureAdminUser = async () => {
  try {
    // Check if admin already exists in profiles
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('username', 'admin')
      .single();

    if (existingAdmin?.role === 'admin') {
      console.log('Admin user already exists');
      return { success: true };
    }

    // Try to sign in first to see if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'bigwinner986@gmail.com',
      password: 'Hanuman@543',
    });

    if (signInError) {
      // User doesn't exist, create new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'bigwinner986@gmail.com',
        password: 'Hanuman@543',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: 'admin',
            full_name: 'Admin User'
          }
        }
      });

      if (signUpError) {
        console.error('Error creating admin user:', signUpError);
        return { error: signUpError };
      }

      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sign in the newly created user
      const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: 'bigwinner986@gmail.com',
        password: 'Hanuman@543',
      });

      if (newSignInError) {
        console.error('Error signing in new admin user:', newSignInError);
        return { error: newSignInError };
      }

      signInData.user = newSignInData.user;
    }

    // Update or insert the profile with admin role
    if (signInData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signInData.user.id,
          username: 'admin',
          full_name: 'Admin User',
          role: 'admin'
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Error updating admin profile:', profileError);
        return { error: profileError };
      }

      console.log('Admin user created/updated successfully');
      return { success: true, user: signInData.user };
    }

    return { error: new Error('Failed to create admin user') };
  } catch (error) {
    console.error('Unexpected error in admin setup:', error);
    return { error };
  }
};

export const createAdminUser = ensureAdminUser;