import { Router } from 'express';
import { listInventory, createInventory, updateInventory, deleteInventory, transferUnit, listTransferred } from '../controllers/inventoryController';
import { handleSiPhotoUpload } from '../utils/fileUpload';
import { authenticateToken, validateEditPassword } from '../utils/auth';

const router = Router();

router.get('/', listInventory);
router.get('/transferred', listTransferred);
// Create and update inventory require password validation
router.post('/', authenticateToken, validateEditPassword, handleSiPhotoUpload, createInventory);
router.post('/transfer', authenticateToken, validateEditPassword, transferUnit);
router.put('/:id', authenticateToken, validateEditPassword, updateInventory);
router.delete('/:id', authenticateToken, deleteInventory);

export default router;
