import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Clear all data from models, inventory, and sales tables
 * WARNING: This is a destructive operation and should only be available to admins
 */
export const clearData = async (req: Request, res: Response) => {
  try {
    // Check if user is admin (you can add role-based checks here)
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[ADMIN] ${userId} initiated data clear operation`);

    // Delete data in order of dependencies
    const results = {
      vehicle_units_deleted: 0,
      inventory_deleted: 0,
      sales_deleted: 0,
      models_deleted: 0,
      po_items_deleted: 0,
      purchase_orders_deleted: 0
    };

    // 1. Delete vehicle units (depends on inventory)
    results.vehicle_units_deleted = await prisma.vehicle_units.deleteMany({});
    console.log(`Deleted ${results.vehicle_units_deleted} vehicle units`);

    // 2. Delete inventory
    results.inventory_deleted = await prisma.inventory_movements.deleteMany({});
    console.log(`Deleted ${results.inventory_deleted} inventory records`);

    // 3. Delete sales
    results.sales_deleted = await prisma.sales.deleteMany({});
    console.log(`Deleted ${results.sales_deleted} sales records`);

    // 4. Delete PO items (depends on purchase orders)
    results.po_items_deleted = await prisma.po_items.deleteMany({});
    console.log(`Deleted ${results.po_items_deleted} PO items`);

    // 5. Delete purchase orders
    results.purchase_orders_deleted = await prisma.purchase_orders.deleteMany({});
    console.log(`Deleted ${results.purchase_orders_deleted} purchase orders`);

    // 6. Delete models
    results.models_deleted = await prisma.models.deleteMany({});
    console.log(`Deleted ${results.models_deleted} models`);

    res.json({
      message: 'Data cleared successfully',
      ...results
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ 
      error: 'Failed to clear data',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
