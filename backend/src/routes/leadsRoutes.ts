import express from 'express';
import * as leadsController from '../controllers/leadsController';
import { authenticateToken } from '../utils/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all leads (main leads page data)
router.get('/', leadsController.getAllLeads);

// Get summary counts for each workflow status
router.get('/summary', leadsController.getLeadsSummary);

// Get specific lead details
router.get('/:id', leadsController.getLeadDetail);

// Update lead workflow status
router.put('/:id/status', leadsController.updateLeadStatus);

// Assign investigator to a lead
router.put('/:id/assign-investigator', leadsController.assignInvestigator);

// Check CI/BI SLA and apply penalties
router.post('/check-sla', leadsController.checkCIBISLA);

export default router;
