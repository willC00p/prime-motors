import { Router } from 'express';
import { listInventory, createInventory, updateInventory, deleteInventory, transferUnit, listTransferred } from '../controllers/inventoryController';
import { handleSiPhotoUpload } from '../utils/fileUpload';

const router = Router();

router.get('/', listInventory);
router.get('/transferred', listTransferred);
router.post('/', handleSiPhotoUpload, createInventory);
router.post('/transfer', transferUnit);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

export default router;
