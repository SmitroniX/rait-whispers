-- Create confessions table
CREATE TABLE public.confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read confessions (public viewing)
CREATE POLICY "Anyone can view confessions"
ON public.confessions
FOR SELECT
USING (true);

-- Allow anyone to create confessions (anonymous posting)
CREATE POLICY "Anyone can create confessions"
ON public.confessions
FOR INSERT
WITH CHECK (true);

-- Enable realtime for confessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.confessions;