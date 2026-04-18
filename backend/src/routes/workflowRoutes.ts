import { Router } from 'express';
import { authenticateToken } from '../utils/auth';
import {
  updateCIBIInvestigation,
  updateHeadOfficeApproval,
  updateBranchApproval,
  updateClientNotification,
  updateUnitRelease,
  updateSalesEncoding,
  completeLead,
  uploadRequirementAttachment,
  getRequirementAttachments,
  getApplicationWithDetails,
} from '../controllers/workflowController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get application with full details
router.get('/:id', getApplicationWithDetails);

// CI/BI Investigation
router.put('/:id/cibi-investigation', updateCIBIInvestigation);

// Head Office Approval (CEO/GM/NSM only)
router.put('/:id/head-office-approval', updateHeadOfficeApproval);

// Branch Approval
router.put('/:id/branch-approval', updateBranchApproval);

// Client Notification
router.put('/:id/client-notification', updateClientNotification);

// Unit Release
router.put('/:id/unit-release', updateUnitRelease);

// Sales Encoding
router.put('/:id/sales-encoding', updateSalesEncoding);

// Complete Lead
router.put('/:id/complete', completeLead);

// Requirements Attachments
router.post('/:id/attachments', uploadRequirementAttachment);
router.get('/:id/attachments', getRequirementAttachments);

export default router;
