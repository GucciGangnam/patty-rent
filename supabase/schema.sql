-- =============================================================================
-- PATTYRENT DATABASE SCHEMA
-- Multi-Organization Membership Model
-- =============================================================================

-- Organisations table
CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- org_memberships: Many-to-many user↔org relationship with role
CREATE TABLE public.org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'agent', 'viewer')),
  is_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organisation_id)
);

-- invitations: Role-specific invite codes with expiry
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'agent', 'viewer')),
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- user_active_org: Tracks current working org for each user
CREATE TABLE public.user_active_org (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_org_memberships_user_id ON public.org_memberships(user_id);
CREATE INDEX idx_org_memberships_organisation_id ON public.org_memberships(organisation_id);
CREATE INDEX idx_invitations_organisation_id ON public.invitations(organisation_id);
CREATE INDEX idx_invitations_invite_code ON public.invitations(invite_code);
CREATE INDEX idx_invitations_expires_at ON public.invitations(expires_at);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_org ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Organisations Policies
-- -----------------------------------------------------------------------------

-- Users can see orgs they're members of
CREATE POLICY "Users can view orgs they are members of"
  ON public.organisations FOR SELECT
  USING (
    id IN (SELECT organisation_id FROM public.org_memberships WHERE user_id = auth.uid())
  );

-- Allow viewing org when validating an invite
CREATE POLICY "Authenticated users can view orgs for invites"
  ON public.organisations FOR SELECT
  USING (
    id IN (SELECT organisation_id FROM public.invitations WHERE expires_at > now() AND use_count < max_uses)
  );

-- Authenticated users can create organisations
CREATE POLICY "Authenticated users can create organisations"
  ON public.organisations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- Users Policies
-- -----------------------------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

-- Users can see profiles in shared orgs
CREATE POLICY "Users can view profiles in shared orgs"
  ON public.users FOR SELECT
  USING (
    id IN (
      SELECT om.user_id FROM public.org_memberships om
      WHERE om.organisation_id IN (
        SELECT organisation_id FROM public.org_memberships WHERE user_id = auth.uid()
      )
    )
  );

-- Allow inserting own profile during signup
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- -----------------------------------------------------------------------------
-- Org Memberships Policies
-- -----------------------------------------------------------------------------

-- Users can see memberships in orgs they belong to
CREATE POLICY "Users can view memberships in their orgs"
  ON public.org_memberships FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM public.org_memberships WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own membership (for joining via invite)
CREATE POLICY "Users can insert their own membership"
  ON public.org_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own membership (leaving an org, but not if owner)
CREATE POLICY "Users can delete their own membership"
  ON public.org_memberships FOR DELETE
  USING (user_id = auth.uid() AND is_owner = false);

-- Managers can update memberships in their org
CREATE POLICY "Managers can update memberships in their org"
  ON public.org_memberships FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Managers can delete memberships in their org (but not owner's)
CREATE POLICY "Managers can delete memberships in their org"
  ON public.org_memberships FOR DELETE
  USING (
    is_owner = false AND
    organisation_id IN (
      SELECT organisation_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- -----------------------------------------------------------------------------
-- Invitations Policies
-- -----------------------------------------------------------------------------

-- Anyone can lookup an invite by code (for validation)
CREATE POLICY "Anyone can lookup invite by code"
  ON public.invitations FOR SELECT
  USING (true);

-- Managers can create invites for their orgs
CREATE POLICY "Managers can create invites"
  ON public.invitations FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Managers can update invites
CREATE POLICY "Managers can update invites"
  ON public.invitations FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Allow authenticated users to update invite use_count (when accepting)
CREATE POLICY "Users can increment invite use count"
  ON public.invitations FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Managers can delete invites
CREATE POLICY "Managers can delete invites"
  ON public.invitations FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM public.org_memberships
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- -----------------------------------------------------------------------------
-- User Active Org Policies
-- -----------------------------------------------------------------------------

-- Users can only see and manage their own active org
CREATE POLICY "Users can view their own active org"
  ON public.user_active_org FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own active org"
  ON public.user_active_org FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own active org"
  ON public.user_active_org FOR UPDATE
  USING (user_id = auth.uid());
