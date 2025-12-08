-- Remove the prompt_rebate_pct column from purchase_orders table
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS prompt_rebate_pct;
