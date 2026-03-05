import { Router } from 'express';
import { clearData, deleteAllModels } from '../controllers/adminController';

const router = Router();

/**
 * Admin endpoints - These should be protected with proper authorization
 */

// Clear all data (models, inventory, sales)
router.post('/clear-data', clearData);

// Delete all models
router.post('/delete-all-models', deleteAllModels);

export default router;
