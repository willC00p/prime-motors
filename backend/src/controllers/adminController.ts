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

    // Delete all models (items table)
    const result = await prisma.items.deleteMany({});
    
    console.log(`Deleted ${result.count} models`);

    res.json({
      message: 'All models deleted successfully',
      models_deleted: result.count
    });
  } catch (error) {
    console.error('Error deleting models:', error);
    res.status(500).json({ 
      error: 'Failed to delete models',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
