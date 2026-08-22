-- ==========================================================
-- ModalHub / Agora Supabase Auth & Profiles Schema Migration
-- ==========================================================

-- 1. Create the `profiles` table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT DEFAULT '🛸',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  creator_status TEXT NOT NULL DEFAULT 'not_creator' CHECK (creator_status IN ('not_creator', 'pending', 'approved', 'rejected')),
  is_creator BOOLEAN DEFAULT false,
  bio TEXT,
  website_url TEXT,
  github_url TEXT,
  verified BOOLEAN DEFAULT false,
  creator_applied_at TIMESTAMPTZ,
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

-- ==========================================================
-- 9. Models Table (Global AI Model Registry & Runtime Mapping)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_logo TEXT DEFAULT '⚡',
  creator_id TEXT DEFAULT 'c1',
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL DEFAULT 'Reasoning',
  tags TEXT[] DEFAULT ARRAY['AI'],
  overall_score NUMERIC DEFAULT 90,
  coding_score NUMERIC DEFAULT 90,
  reasoning_score NUMERIC DEFAULT 90,
  math_score NUMERIC DEFAULT 90,
  vision_score NUMERIC DEFAULT 0,
  speed_tokens_per_sec NUMERIC DEFAULT 60,
  latency_ms NUMERIC DEFAULT 400,
  context_window TEXT DEFAULT '128K tokens',
  context_window_tokens INTEGER DEFAULT 128000,
  parameters TEXT DEFAULT 'Weights',
  input_price_per_million NUMERIC DEFAULT 0.20,
  output_price_per_million NUMERIC DEFAULT 0.80,
  cached_input_price_per_million NUMERIC,
  batch_discount_percent INTEGER DEFAULT 50,
  is_open_source BOOLEAN DEFAULT true,
  license TEXT DEFAULT 'Open Weights',
  access_methods TEXT[] DEFAULT ARRAY['REST API', 'Local Ollama'],
  endpoint TEXT,
  model_endpoint_id TEXT,
  runtime TEXT DEFAULT 'ollama',
  runtime_model_id TEXT,
  best_for TEXT,
  rating NUMERIC DEFAULT 4.8,
  reviews_count INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for models table
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Models are viewable by all users (authenticated and anonymous)
CREATE POLICY "Models are viewable by everyone"
  ON public.models
  FOR SELECT
  USING (true);

-- Insert or update default runtime models
INSERT INTO public.models (
  id, name, provider, provider_logo, description, long_description,
  category, tags, overall_score, speed_tokens_per_sec, latency_ms,
  context_window, parameters, input_price_per_million, output_price_per_million,
  is_open_source, license, access_methods, runtime, runtime_model_id, rating, reviews_count
) VALUES
(
  'qwen3',
  'Qwen3',
  'Alibaba Cloud',
  '⚡',
  'Ultra-lightweight Qwen3 foundation model optimized for instant local inference and code generation.',
  'Qwen3 0.6B is a breakthrough ultra-compact foundation model trained on high-density multilingual tokens, math reasoning, and code synthesis. It runs locally with near-zero latency on CPU and low-power hardware.',
  'Coding',
  ARRAY['Coding', 'Fast', 'Open Weights', 'Lightweight', 'Local AI'],
  95.5, 140, 12, '32K tokens', '0.6B Dense', 0.05, 0.20,
  true, 'Apache 2.0', ARRAY['Local Ollama', 'REST API', 'Python SDK'],
  'ollama', 'qwen3:0.6b', 4.9, 1840
),
(
  'llama-3-2',
  'Llama 3.2',
  'Meta',
  '🦙',
  'Meta compact edge powerhouse with multimodal understanding and strong multilingual instruction following.',
  'Llama 3.2 3B is engineered for state-of-the-art on-device reasoning and conversational depth.',
  'Reasoning',
  ARRAY['Reasoning', 'Edge AI', 'Open Weights', 'Fast', 'Local AI'],
  94.2, 110, 18, '128K tokens', '3B Dense', 0.10, 0.40,
  true, 'Llama 3.2 Community', ARRAY['Local Ollama', 'REST API', 'vLLM'],
  'ollama', 'llama3.2', 4.8, 3200
),
(
  'gemma3',
  'Gemma 3',
  'Google',
  '✨',
  'Google next-gen lightweight open model built with Gemini research for responsive text and reasoning.',
  'Gemma 3 1B is Google latest lightweight, state-of-the-art open model family built from the same research and technology used to create Gemini models.',
  'Reasoning',
  ARRAY['Reasoning', 'Open Weights', 'Google Research', 'Local AI'],
  94.0, 125, 15, '32K tokens', '1B Dense', 0.08, 0.30,
  true, 'Gemma Terms of Use', ARRAY['Local Ollama', 'REST API', 'Hugging Face'],
  'ollama', 'gemma3:1b', 4.8, 1650
),
(
  'deepseek-r1',
  'DeepSeek-R1',
  'DeepSeek',
  '🐋',
  'SOTA open-weights reasoning model with chain-of-thought verification and competitive math performance.',
  'DeepSeek-R1 achieves state-of-the-art reasoning, math, and coding performance comparable to leading closed models.',
  'Reasoning',
  ARRAY['Reasoning', 'Math', 'Coding', 'Open Weights', 'Local AI'],
  98.2, 68, 38, '128K tokens', '8B Distill / 671B MoE', 0.14, 0.55,
  true, 'MIT License', ARRAY['Local Ollama', 'REST API', 'Python SDK'],
  'ollama', 'deepseek-r1:8b', 4.9, 24500
),
(
  'qwen-2-5-coder-7b',
  'Qwen 2.5 Coder 7B',
  'Alibaba Cloud',
  '⚡',
  'High-performance coding transformer optimized for IDE autocomplete and script generation.',
  'Qwen 2.5 Coder 7B provides competitive coding capabilities surpassing many 33B models.',
  'Coding',
  ARRAY['Coding', 'Open Weights', 'Apache 2.0', 'Local AI'],
  96.0, 90, 25, '128K tokens', '7.6B Dense', 0.12, 0.45,
  true, 'Apache 2.0', ARRAY['Local Ollama', 'REST API', 'vLLM'],
  'ollama', 'qwen2.5-coder:7b', 4.9, 1950
)
ON CONFLICT (id) DO UPDATE SET
  runtime = EXCLUDED.runtime,
  runtime_model_id = EXCLUDED.runtime_model_id,
  updated_at = NOW();

-- ==========================================================
-- 10. Creator Applications Table (Phase 1 Creator Access)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT DEFAULT '🛸',
  bio TEXT NOT NULL,
  portfolio_url TEXT,
  github_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creator_apps_user_id ON public.creator_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_creator_apps_status ON public.creator_applications (status);

ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own creator applications"
  ON public.creator_applications
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Authenticated users can insert an application
CREATE POLICY "Users can insert own creator application"
  ON public.creator_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update creator applications (approve/reject)
CREATE POLICY "Admins can update creator applications"
  ON public.creator_applications
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================================
-- 11. Model Submissions Table (Phase 1 Creator Model Workflow)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.model_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL DEFAULT 'Reasoning' CHECK (category IN ('Reasoning', 'Coding', 'Image', 'Video', 'Audio', 'Vision', 'Writing', 'Agents', 'Speech', 'Science')),
  tags TEXT[] DEFAULT ARRAY['AI'],
  version TEXT NOT NULL DEFAULT '1.0.0',
  license TEXT NOT NULL DEFAULT 'Apache 2.0',
  model_size TEXT,
  parameters TEXT,
  runtime TEXT NOT NULL DEFAULT 'ollama',
  runtime_model_id TEXT,
  source_url TEXT NOT NULL,
  thumbnail_url TEXT,
  banner_url TEXT,
  deployable BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'published', 'unpublished')),
  admin_notes TEXT,
  published_model_id TEXT REFERENCES public.models(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  CONSTRAINT unique_creator_submission_slug UNIQUE (creator_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_model_submissions_creator ON public.model_submissions (creator_id);
CREATE INDEX IF NOT EXISTS idx_model_submissions_status ON public.model_submissions (status);
CREATE INDEX IF NOT EXISTS idx_model_submissions_slug ON public.model_submissions (slug);

ALTER TABLE public.model_submissions ENABLE ROW LEVEL SECURITY;

-- SELECT: Creators can see their own submissions; Admins can see all submissions
CREATE POLICY "Creators see own submissions, admins see all"
  ON public.model_submissions
  FOR SELECT
  USING (
    auth.uid() = creator_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- INSERT: Authenticated creators/admins can insert submissions for their own creator_id
CREATE POLICY "Creators can insert own submissions"
  ON public.model_submissions
  FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_creator = true OR role IN ('creator', 'admin')))
    )
  );

-- UPDATE:
-- Creators can update their own submissions ONLY when in 'draft' or 'rejected' status (or publish when 'approved')
-- Admins can update any submission (to approve, reject, or comment)
CREATE POLICY "Creators can update own drafts and rejected submissions"
  ON public.model_submissions
  FOR UPDATE
  USING (
    (auth.uid() = creator_id AND status IN ('draft', 'rejected', 'approved'))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.uid() = creator_id AND status IN ('draft', 'pending_review', 'published', 'unpublished'))
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: Creators can only delete their own drafts
CREATE POLICY "Creators can delete own drafts"
  ON public.model_submissions
  FOR DELETE
  USING (
    auth.uid() = creator_id AND status = 'draft'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger for auto updated_at on model_submissions
DROP TRIGGER IF EXISTS handle_model_submissions_updated_at ON public.model_submissions;
CREATE TRIGGER handle_model_submissions_updated_at
  BEFORE UPDATE ON public.model_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-sync approved/published submissions to public models table
CREATE OR REPLACE FUNCTION public.sync_published_submission_to_models()
RETURNS TRIGGER AS $$
DECLARE
  creator_profile RECORD;
  model_id_val TEXT;
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    SELECT * INTO creator_profile FROM public.profiles WHERE id = NEW.creator_id;
    model_id_val := COALESCE(NEW.published_model_id, NEW.slug);

    INSERT INTO public.models (
      id,
      name,
      provider,
      provider_logo,
      creator_id,
      creator,
      description,
      long_description,
      category,
      tags,
      parameters,
      model_size,
      version,
      license,
      runtime,
      runtime_model_id,
      endpoint,
      thumbnail_url,
      banner_url,
      deployable,
      is_open_source,
      overall_score,
      rating,
      created_at,
      updated_at
    ) VALUES (
      model_id_val,
      NEW.name,
      COALESCE(creator_profile.display_name, 'Agora Creator'),
      COALESCE(creator_profile.avatar_url, '⚡'),
      NEW.creator_id::text,
      COALESCE(creator_profile.display_name, 'Agora Creator'),
      NEW.description,
      COALESCE(NEW.long_description, NEW.description),
      NEW.category,
      NEW.tags,
      COALESCE(NEW.parameters, 'Foundation Weights'),
      NEW.model_size,
      NEW.version,
      NEW.license,
      NEW.runtime,
      NEW.runtime_model_id,
      NEW.source_url,
      NEW.thumbnail_url,
      NEW.banner_url,
      NEW.deployable,
      true,
      95.0,
      5.0,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      long_description = EXCLUDED.long_description,
      category = EXCLUDED.category,
      tags = EXCLUDED.tags,
      version = EXCLUDED.version,
      license = EXCLUDED.license,
      runtime = EXCLUDED.runtime,
      runtime_model_id = EXCLUDED.runtime_model_id,
      thumbnail_url = EXCLUDED.thumbnail_url,
      banner_url = EXCLUDED.banner_url,
      updated_at = NOW();

    NEW.published_model_id := model_id_val;
    NEW.published_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_published_submission ON public.model_submissions;
CREATE TRIGGER trigger_sync_published_submission
  BEFORE UPDATE ON public.model_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sync_published_submission_to_models();



