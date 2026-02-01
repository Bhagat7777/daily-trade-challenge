-- Add has_chart and has_analysis columns to trade_submissions
ALTER TABLE public.trade_submissions
ADD COLUMN IF NOT EXISTS has_chart boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_analysis boolean DEFAULT false;