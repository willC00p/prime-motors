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
