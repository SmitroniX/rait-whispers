-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add IP address to confessions table
ALTER TABLE public.confessions
ADD COLUMN ip_address text;

-- Create likes table
CREATE TABLE public.confession_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid REFERENCES public.confessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (confession_id, user_id),
  UNIQUE (confession_id, ip_address)
);

ALTER TABLE public.confession_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
ON public.confession_likes
FOR SELECT
USING (true);

-- Anyone can create likes (anonymous or authenticated)
CREATE POLICY "Anyone can create likes"
ON public.confession_likes
FOR INSERT
WITH CHECK (true);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
ON public.confession_likes
FOR DELETE
USING (auth.uid() = user_id OR ip_address = current_setting('request.headers', true)::json->>'x-forwarded-for');

-- Create comments table
CREATE TABLE public.confession_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid REFERENCES public.confessions(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.confession_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
ON public.confession_comments
FOR SELECT
USING (true);

-- Anyone can create comments
CREATE POLICY "Anyone can create comments"
ON public.confession_comments
FOR INSERT
WITH CHECK (true);

-- Admins can delete any confession
CREATE POLICY "Admins can delete confessions"
ON public.confessions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any comment
CREATE POLICY "Admins can delete comments"
ON public.confession_comments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.confession_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.confession_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;