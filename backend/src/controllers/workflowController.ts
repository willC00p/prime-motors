import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Update CI/BI Investigation Status
 * All authenticated users can approve/disapprove/mark for further evaluation
 */
export const updateCIBIInvestigation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = (req as any).userId;

    // Validate status
    const validStatuses = ['IN_PROGRESS', 'APPROVED', 'DISAPPROVED', 'FURTHER_EVALUATION'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: {
        cibi_investigation_status: status,
        cibi_investigation_notes: notes,
        cibi_completed_at: new Date(),
        workflow_status: status === 'APPROVED' || status === 'DISAPPROVED' ? 'CI_BI_RESULT' : 'CI_BI',
      },
      include: {
        cibi_applications: true,
        investigator: true,
      },
    });

    res.json({ success: true, data: application, message: 'CI/BI investigation updated' });
  } catch (error) {
    console.error('Error updating CI/BI investigation:', error);
    res.status(500).json({ success: false, message: 'Error updating investigation' });
  }
};

/**
 * Head Office Approval/Disapproval
 * CEO/GM/NSM can approve or disapprove applications (branch users cannot)
 */
export const updateHeadOfficeApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved, notes } = req.body;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Branch users cannot approve at head office level
    if (userRole === 'branch') {
      return res.status(403).json({ success: false, message: 'Branch users cannot approve at head office level' });
    }

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: {
        head_office_approved: approved,
        head_office_notes: notes,
        head_office_approved_by: userId,
        head_office_approved_at: new Date(),
        workflow_status: approved ? 'BRANCH_APPROVAL' : 'CI_BI_RESULT',
        cibi_result: approved ? 'APPROVED' : 'DISAPPROVED',
      },
      include: {
        head_office_approver: true,
        cibi_applications: true,
      },
    });

    res.json({ success: true, data: application, message: 'Head office approval updated' });
  } catch (error) {
    console.error('Error updating head office approval:', error);
    res.status(500).json({ success: false, message: 'Error updating approval' });
  }
};

/**
 * Branch Approval
 * All authenticated users can view details and approve
 */
export const updateBranchApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = (req as any).userId;

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: {
        branch_status: status,
        branch_notes: notes,
        branch_approved_by: userId,
        branch_submitted_at: new Date(),
        workflow_status: 'CLIENT_NOTIFICATION',
      },
      include: {
        branches: true,
        branch_approver: true,
      },
    });

    res.json({ success: true, data: application, message: 'Branch approval updated' });
  } catch (error) {
    console.error('Error updating branch approval:', error);
    res.status(500).json({ success: false, message: 'Error updating branch approval' });
  }
};

/**
 * Update Client Notification Status
 */
export const updateClientNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['NOTIFIED', 'CLIENT_RESPONDED', 'CLIENT_NOT_RESPONDING'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: {
        client_notification_status: status,
        client_notified_at: new Date(),
        workflow_status: status === 'CLIENT_RESPONDED' ? 'UNIT_RELEASE' : 'CLIENT_NOTIFICATION',
      },
      include: {
        branches: true,
      },
    });

    res.json({ success: true, data: application, message: 'Client notification updated' });
  } catch (error) {
    console.error('Error updating client notification:', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

/**
 * Update Unit Release Status
 */
export const updateUnitRelease = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['NOT_YET_RELEASED', 'RELEASED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: {
        unit_release_status: status,
        unit_released_at: status === 'RELEASED' || status === 'DELIVERED' ? new Date() : null,
        workflow_status: status === 'DELIVERED' ? 'SALES_ENCODING' : 'UNIT_RELEASE',
      },
      include: {
        branches: true,
      },
    });

    res.json({ success: true, data: application, message: 'Unit release status updated' });
  } catch (error) {
    console.error('Error updating unit release:', error);
    res.status(500).json({ success: false, message: 'Error updating release' });
  }
};

/**
 * Update Sales Encoding with data from sales monitoring
 */
export const updateSalesEncoding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sales_data } = req.body;

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: {
        sales_data: sales_data,
        sales_encoded_at: new Date(),
      },
      include: {
        branches: true,
      },
    });

    res.json({ success: true, data: application, message: 'Sales data encoded' });
  } catch (error) {
    console.error('Error updating sales encoding:', error);
    res.status(500).json({ success: false, message: 'Error encoding sales' });
  }
};

/**
 * Complete Lead - Mark as finished
 */
export const completeLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: {
        workflow_status: 'COMPLETED',
        lead_completed_at: new Date(),
      },
      include: {
        branches: true,
        creator: true,
        investigator: true,
        head_office_approver: true,
      },
    });

    res.json({ success: true, data: application, message: 'Lead completed successfully' });
  } catch (error) {
    console.error('Error completing lead:', error);
    res.status(500).json({ success: false, message: 'Error completing lead' });
  }
};

/**
 * Upload Requirement Attachment
 */
export const uploadRequirementAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { file_name, file_url, file_key, file_type, file_size, upload_type } = req.body;
    const userId = (req as any).userId;

    const attachment = await prisma.requirement_attachments.create({
      data: {
        application_id: parseInt(id),
        file_name,
        file_url,
        file_key,
        file_type,
        file_size,
        upload_type, // PARTIAL or COMPLETE
        uploaded_by: userId,
      },
      include: {
        uploader: true,
      },
    });

    // Update application requirements_status if COMPLETE
    if (upload_type === 'COMPLETE') {
      await prisma.applications.update({
        where: { id: parseInt(id) },
        data: {
          requirements_status: 'COMPLETE',
          requirements_submitted_at: new Date(),
        },
      });
    }

    res.json({ success: true, data: attachment, message: 'Attachment uploaded' });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ success: false, message: 'Error uploading attachment' });
  }
};

/**
 * Get Requirement Attachments for an application
 */
export const getRequirementAttachments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attachments = await prisma.requirement_attachments.findMany({
      where: { application_id: parseInt(id) },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: attachments });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ success: false, message: 'Error fetching attachments' });
  }
};

/**
 * Get Application with Full Workflow Details
 */
export const getApplicationWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await prisma.applications.findUnique({
      where: { id: parseInt(id) },
      include: {
        branches: true,
        creator: true,
        investigator: true,
        head_office_approver: true,
        branch_approver: true,
        cibi_applications: {
          include: {
            investigator: true,
          },
        },
        requirement_attachments: {
          include: {
            uploader: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ success: false, message: 'Error fetching application' });
  }
};
