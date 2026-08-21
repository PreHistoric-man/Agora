-- ==========================================================
-- ModalHub / Agora Supabase Auth & Profiles Schema Migration
-- ==========================================================

-- 1. Create the `profiles` table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT DEFAULT '🛸',
  is_creator BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Policy: Allow users to view all public profiles (needed for creator info & community display)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update only their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 4. Automatic Profile Creation Function & Trigger
-- Trigger function that automatically creates a profile entry whenever a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, is_creator, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text, 1, 4)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      '🛸'
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'is_creator')::boolean,
      false
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after a new row is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Updated_at auto-updater function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================
-- 6. User Library Table (Steam-style AI Model Library)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  installed BOOLEAN DEFAULT false NOT NULL,
  installed_version TEXT DEFAULT NULL,
  deployment_status TEXT DEFAULT 'not_deployed' NOT NULL CHECK (deployment_status IN ('not_deployed', 'deploying', 'running', 'stopped', 'failed')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_model UNIQUE (user_id, model_id)
);

-- Index for fast lookup by user and model
CREATE INDEX IF NOT EXISTS idx_library_user_id ON public.library (user_id);
CREATE INDEX IF NOT EXISTS idx_library_user_model ON public.library (user_id, model_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.library ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- SELECT: Users can only read their own library items
CREATE POLICY "Users can view their own library entries"
  ON public.library
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Authenticated users can only insert rows for their own user_id
CREATE POLICY "Users can insert their own library entries"
  ON public.library
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own library entries (e.g. install / deployment status)
CREATE POLICY "Users can update their own library entries"
  ON public.library
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only remove models from their own library
CREATE POLICY "Users can delete their own library entries"
  ON public.library
  FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger for library table
DROP TRIGGER IF EXISTS handle_library_updated_at ON public.library;
CREATE TRIGGER handle_library_updated_at
  BEFORE UPDATE ON public.library
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================
-- 7. Deployments Table (Phase 1 AI Model Deployment System)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('local', 'aws', 'modalhub')),
  deployment_type TEXT NOT NULL CHECK (deployment_type IN ('local', 'cloud')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'running', 'stopped', 'failed', 'terminated')),
  region TEXT,
  instance_type TEXT,
  gpu_type TEXT,
  endpoint TEXT DEFAULT NULL,
  api_key TEXT DEFAULT NULL,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON public.deployments (user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_model_id ON public.deployments (model_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments (status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON public.deployments (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- SELECT: Users can only read their own deployments
CREATE POLICY "Users can view their own deployments"
  ON public.deployments
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Authenticated users can only insert deployments for their own user_id
CREATE POLICY "Users can insert their own deployments"
  ON public.deployments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own deployments
CREATE POLICY "Users can update their own deployments"
  ON public.deployments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete/terminate their own deployments
CREATE POLICY "Users can delete their own deployments"
  ON public.deployments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger for deployments table
DROP TRIGGER IF EXISTS handle_deployments_updated_at ON public.deployments;
CREATE TRIGGER handle_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Database-level check: Verify model exists in user's library before deployment creation
CREATE OR REPLACE FUNCTION public.check_model_in_user_library()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.library
    WHERE user_id = NEW.user_id AND model_id = NEW.model_id
  ) THEN
    RAISE EXCEPTION 'You must add this model to your library before deploying it.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_model_in_library ON public.deployments;
CREATE TRIGGER trigger_check_model_in_library
  BEFORE INSERT ON public.deployments
  FOR EACH ROW EXECUTE FUNCTION public.check_model_in_user_library();

-- ==========================================================
-- 8. AWS Connections Table (Phase 2A AWS Account Verification)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.aws_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  role_arn TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'failed', 'disconnected')),
  external_id TEXT DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  verified_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_aws_account UNIQUE (user_id, account_id)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_aws_connections_user_id ON public.aws_connections (user_id);
CREATE INDEX IF NOT EXISTS idx_aws_connections_status ON public.aws_connections (status);
CREATE INDEX IF NOT EXISTS idx_aws_connections_account ON public.aws_connections (account_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.aws_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- SELECT: Users can only view their own AWS connections
CREATE POLICY "Users can view their own AWS connections"
  ON public.aws_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Authenticated users can only insert AWS connections for their own user_id
CREATE POLICY "Users can insert their own AWS connections"
  ON public.aws_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own AWS connections
CREATE POLICY "Users can update their own AWS connections"
  ON public.aws_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own AWS connections
CREATE POLICY "Users can delete their own AWS connections"
  ON public.aws_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger for aws_connections table
DROP TRIGGER IF EXISTS handle_aws_connections_updated_at ON public.aws_connections;
CREATE TRIGGER handle_aws_connections_updated_at
  BEFORE UPDATE ON public.aws_connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

