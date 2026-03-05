import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Clear all data from models, inventory, and sales tables
 * WARNING: This is a destructive operation and should only be available to admins
 */
export const clearData = async (req: Request, res: Response) => {
  try {
    // This endpoint is currently disabled for security reasons
    return res.status(403).json({ 
      error: 'Endpoint disabled',
      message: 'The data clear endpoint is currently disabled for security reasons.'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete all motorcycle models
 */
export const deleteAllModels = async (req: Request, res: Response) => {
  try {
    console.log('[ADMIN] Delete all models initiated');

    const results = {
      sales_items_deleted: 0,
      sales_deleted: 0,
      vehicle_units_deleted: 0,
      inventory_deleted: 0,
      purchase_order_items_deleted: 0,
      purchase_orders_deleted: 0,
      models_deleted: 0
    };

    // Delete in dependency order
    // 1. Delete sales items first (references vehicle_units)
    const salesItemsResult = await prisma.sales_items.deleteMany({});
    results.sales_items_deleted = salesItemsResult.count;
    console.log(`Deleted ${results.sales_items_deleted} sales items`);

    // 2. Delete sales
    const salesResult = await prisma.sales.deleteMany({});
    results.sales_deleted = salesResult.count;
    console.log(`Deleted ${results.sales_deleted} sales records`);

    // 3. Delete vehicle units (references items)
    const vehicleUnitsResult = await prisma.vehicle_units.deleteMany({});
    results.vehicle_units_deleted = vehicleUnitsResult.count;
    console.log(`Deleted ${results.vehicle_units_deleted} vehicle units`);

    // 4. Delete inventory movements
    const inventoryResult = await prisma.inventory_movements.deleteMany({});
    results.inventory_deleted = inventoryResult.count;
    console.log(`Deleted ${results.inventory_deleted} inventory records`);

    // 5. Delete purchase order items
    const poItemsResult = await prisma.purchase_order_items.deleteMany({});
    results.purchase_order_items_deleted = poItemsResult.count;
    console.log(`Deleted ${results.purchase_order_items_deleted} PO items`);

    // 6. Delete purchase orders
    const poResult = await prisma.purchase_orders.deleteMany({});
    results.purchase_orders_deleted = poResult.count;
    console.log(`Deleted ${results.purchase_orders_deleted} purchase orders`);

    // 7. Finally delete all models/items
    const modelsResult = await prisma.items.deleteMany({});
    results.models_deleted = modelsResult.count;
    console.log(`Deleted ${results.models_deleted} models`);

    res.json({
      message: 'All models and dependencies deleted successfully',
      ...results
    });
  } catch (error) {
    console.error('Error deleting models:', error);
    res.status(500).json({ 
      error: 'Failed to delete models',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
