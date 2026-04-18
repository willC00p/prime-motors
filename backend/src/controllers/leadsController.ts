import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Get all applications for Leads monitoring
 * Filtered by branch and includes pagination
 */
export const getAllLeads = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const userBranchId = (req as any).userBranchId;
    const userRole = (req as any).userRole;

    const { page = 1, limit = 50, workflow_status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    // Filter by user's branch if not admin
    if (userRole !== 'admin') {
      where.branch_id = userBranchId;
    }

    // Filter by workflow status if provided
    if (workflow_status && workflow_status !== 'ALL') {
      where.workflow_status = workflow_status as string;
    }

    // Search by applicant name or email
    if (search) {
      where.OR = [
        { applicant_name: { contains: search as string, mode: 'insensitive' } },
        { applicant_email: { contains: search as string, mode: 'insensitive' } },
        { applicant_phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.applications.count({ where });

    // Get applications with related data
    const applications = await prisma.applications.findMany({
      where,
      include: {
        branches: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
        investigator: { select: { id: true, name: true, email: true } },
        cibi_applications: {
          select: {
            id: true,
            status: true,
            system_recommendation: true,
            investigation_findings: true,
          },
          take: 1,
        },
      },
      orderBy: { updated_at: 'desc' },
      skip,
      take: limitNum,
    });

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads', details: error });
  }
};

/**
 * Get lead status summary counts
 */
export const getLeadsSummary = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).userRole;
    const userBranchId = (req as any).userBranchId;

    const where: any = {};
    if (userRole !== 'admin') {
      where.branch_id = userBranchId;
    }

    const statuses = [
      'APPLICATION',
      'LEADS',
      'SUBMIT_REQS',
      'CI_BI',
      'CI_BI_RESULT',
      'HEAD_OFFICE',
      'BRANCH_APPROVAL',
      'CLIENT_NOTIFICATION',
      'UNIT_RELEASE',
      'SALES_ENCODING',
    ];

    const summary: any = {};

    for (const status of statuses) {
      summary[status] = await prisma.applications.count({
        where: { ...where, workflow_status: status },
      });
    }

    // Add SLA exceeded count
    summary.SLA_EXCEEDED = await prisma.applications.count({
      where: { ...where, cibi_sla_exceeded: true },
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching leads summary:', error);
    res.status(500).json({ error: 'Failed to fetch leads summary', details: error });
  }
};

/**
 * Update application workflow status
 */
export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workflow_status, notes, requirements_status } = req.body;
    const userId = (req as any).userId;

    if (!workflow_status) {
      return res.status(400).json({ error: 'workflow_status is required' });
    }

    // Map workflow status to timestamp field
    const timestampMap: any = {
      LEADS: { leads_entered_at: new Date() },
      SUBMIT_REQS: { requirements_submitted_at: new Date(), requirements_status },
      CI_BI: { cibi_started_at: new Date() },
      CI_BI_RESULT: { cibi_completed_at: new Date() },
      HEAD_OFFICE: { head_office_submitted_at: new Date() },
      BRANCH_APPROVAL: { branch_submitted_at: new Date(), branch_approved_at: new Date() },
      CLIENT_NOTIFICATION: { client_notified_at: new Date() },
      UNIT_RELEASE: { unit_released_at: new Date() },
      SALES_ENCODING: { sales_encoded_at: new Date() },
    };

    const updateData: any = {
      workflow_status,
      updated_at: new Date(),
    };

    // Add timestamp if applicable
    if (timestampMap[workflow_status]) {
      Object.assign(updateData, timestampMap[workflow_status]);
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        branches: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        investigator: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: `Application moved to ${workflow_status}`,
      data: application,
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: 'Failed to update lead status', details: error });
  }
};

/**
 * Assign investigator to application
 */
export const assignInvestigator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { investigator_id } = req.body;

    if (!investigator_id) {
      return res.status(400).json({ error: 'investigator_id is required' });
    }

    const application = await prisma.applications.update({
      where: { id: parseInt(id) },
      data: { assigned_investigator_id: investigator_id },
      include: {
        investigator: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      message: 'Investigator assigned successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error assigning investigator:', error);
    res.status(500).json({ error: 'Failed to assign investigator', details: error });
  }
};

/**
 * Check CI/BI SLA and update penalty if exceeded
 */
export const checkCIBISLA = async (req: Request, res: Response) => {
  try {
    const SLA_HOURS = 24;
    const SLA_PENALTY_PER_HOUR = 100; // Penalty amount per hour exceeded

    // Find all CI/BI results that haven't been checked yet
    const applications = await prisma.applications.findMany({
      where: {
        cibi_completed_at: { not: null },
        cibi_sla_exceeded: false, // Not yet marked as exceeded
      },
    });

    let updated = 0;

    for (const app of applications) {
      if (app.cibi_started_at && app.cibi_completed_at) {
        const timeDiff = app.cibi_completed_at.getTime() - app.cibi_started_at.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff > SLA_HOURS) {
          const hoursExceeded = Math.ceil(hoursDiff - SLA_HOURS);
          const penalty = hoursExceeded * SLA_PENALTY_PER_HOUR;

          await prisma.applications.update({
            where: { id: app.id },
            data: {
              cibi_sla_exceeded: true,
              cibi_penalty_amount: penalty,
            },
          });

          updated++;
        }
      }
    }

    res.json({
      success: true,
      message: `SLA check completed. Updated ${updated} applications with penalties.`,
      data: { updated },
    });
  } catch (error) {
    console.error('Error checking CI/BI SLA:', error);
    res.status(500).json({ error: 'Failed to check CI/BI SLA', details: error });
  }
};

/**
 * Get application details with full workflow history
 */
export const getLeadDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await prisma.applications.findUnique({
      where: { id: parseInt(id) },
      include: {
        branches: true,
        creator: { select: { id: true, name: true, email: true } },
        investigator: { select: { id: true, name: true, email: true } },
        cibi_applications: {
          select: {
            id: true,
            full_name: true,
            status: true,
            system_recommendation: true,
            manual_recommendation: true,
            investigation_findings: true,
            prepared_date: true,
            cibi_started_at: true,
            cibi_completed_at: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    console.error('Error fetching lead detail:', error);
    res.status(500).json({ error: 'Failed to fetch lead detail', details: error });
  }
};
