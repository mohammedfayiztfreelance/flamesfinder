-- Create table to store FLAMES calculations
CREATE TABLE public.flames_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name1 TEXT NOT NULL,
  name2 TEXT NOT NULL,
  letter_count INTEGER NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flames_calculations ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (anyone can calculate)
CREATE POLICY "Anyone can insert calculations"
ON public.flames_calculations
FOR INSERT
WITH CHECK (true);

-- Create policy for public select (for analytics/viewing)
CREATE POLICY "Anyone can view calculations"
ON public.flames_calculations
FOR SELECT
USING (true);