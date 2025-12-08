-- CreateMigration
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS check_number VARCHAR(50);

-- Add constraint
ALTER TABLE purchase_orders 
ADD CONSTRAINT valid_payment_status 
CHECK (payment_status IN ('paid', 'unpaid'));
