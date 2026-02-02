-- Add has_trade_idea column to trade_submissions
ALTER TABLE public.trade_submissions
ADD COLUMN IF NOT EXISTS has_trade_idea boolean DEFAULT false;