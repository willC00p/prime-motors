-- Increase precision of decimal fields in all relevant tables
ALTER TABLE purchase_orders 
    ALTER COLUMN dealer_discount TYPE DECIMAL(12,2);

ALTER TABLE purchase_order_items 
    ALTER COLUMN unit_price TYPE DECIMAL(12,2),
    ALTER COLUMN amount TYPE DECIMAL(12,2),
    ALTER COLUMN rebate_percentage TYPE DECIMAL(12,2);
