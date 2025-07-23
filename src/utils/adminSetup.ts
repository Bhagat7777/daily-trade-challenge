import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  try {
    // First try to sign up the user
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

    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('Error creating admin user:', signUpError);
      return { error: signUpError };
    }

    // Try to sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'bigwinner986@gmail.com',
      password: 'Hanuman@543',
    });

    if (signInError) {
      console.error('Error signing in admin user:', signInError);
      return { error: signInError };
    }

    // Update the profile with admin role if user exists
    if (signInData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signInData.user.id,
          username: 'admin',
          full_name: 'Admin User',
          role: 'admin'
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return { error: profileError };
      }
    }

    return { data: signInData, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error };
  }
};