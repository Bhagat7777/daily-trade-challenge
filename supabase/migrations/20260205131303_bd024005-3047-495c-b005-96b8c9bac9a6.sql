-- Drop and recreate the handle_new_user function to handle duplicate usernames
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  desired_username TEXT;
  final_username TEXT;
  username_suffix INT := 0;
BEGIN
  -- Get the desired username from metadata
  desired_username := NEW.raw_user_meta_data->>'username';
  
  -- If no username provided, use email prefix
  IF desired_username IS NULL OR desired_username = '' THEN
    desired_username := split_part(NEW.email, '@', 1);
  END IF;
  
  -- Start with the desired username
  final_username := desired_username;
  
  -- Check if username exists and add suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    username_suffix := username_suffix + 1;
    final_username := desired_username || username_suffix::TEXT;
  END LOOP;
  
  -- Insert the profile with unique username
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username'),
    final_username
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If still fails (race condition), try with random suffix
    final_username := desired_username || floor(random() * 10000)::TEXT;
    INSERT INTO public.profiles (id, full_name, username)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username'),
      final_username
    );
    RETURN NEW;
END;
$$;