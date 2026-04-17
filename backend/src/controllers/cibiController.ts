import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CIBIApplicationRequest, CIBIApplicationResponse, InvestigationFindingsParams } from "../types/cibi";

const prisma = new PrismaClient();

// Generate investigation findings based on gathered information
export const generateInvestigationFindings = (params: InvestigationFindingsParams): string => {
  const { monthly_income, estimated_monthly_expenses, existing_loan, previous_loans_status, credit_standing, capacity_to_pay } = params;

  let findings = "";
  const issues: string[] = [];
  const strengths: string[] = [];

  // Income Analysis
  if (monthly_income && monthly_income > 0) {
    strengths.push(`Stable monthly income of ₱${monthly_income.toFixed(2)}`);
  } else {
    issues.push("No verifiable income source");
  }

  // Expense Analysis
  if (estimated_monthly_expenses && monthly_income && estimated_monthly_expenses < monthly_income * 0.7) {
    strengths.push("Reasonable monthly expenses relative to income");
  } else if (estimated_monthly_expenses && monthly_income && estimated_monthly_expenses >= monthly_income) {
    issues.push("Estimated expenses exceed or match income");
  }

  // Loan History
  if (previous_loans_status === "Paid") {
    strengths.push("Good history of loan payment");
  } else if (previous_loans_status === "Defaulted") {
    issues.push("History of loan default");
  } else if (previous_loans_status === "Unpaid") {
    issues.push("Outstanding unpaid loans");
  }

  // Credit Standing
  if (credit_standing === "Good") {
    strengths.push("Good credit standing");
  } else if (credit_standing === "Bad") {
    issues.push("Poor credit standing");
  }

  // Capacity to Pay
  if (capacity_to_pay && capacity_to_pay > 0) {
    strengths.push(`Demonstrated capacity to pay of ₱${capacity_to_pay.toFixed(2)}`);
  }

  // Existing Loan
  if (existing_loan) {
    issues.push("Applicant has existing loan obligations");
  }

  // Generate summary
  findings = "## INVESTIGATION FINDINGS SUMMARY\n\n";
  
  if (strengths.length > 0) {
    findings += "**Strengths:**\n";
    strengths.forEach((s) => {
      findings += `• ${s}\n`;
    });
    findings += "\n";
  }

  if (issues.length > 0) {
    findings += "**Areas of Concern:**\n";
    issues.forEach((i) => {
      findings += `• ${i}\n`;
    });
    findings += "\n";
  }

  // System Recommendation
  const concernCount = issues.length;
  const strengthCount = strengths.length;

  if (concernCount === 0 && strengthCount > 3) {
    findings += "**System Recommendation:** APPROVED - Applicant demonstrates strong financial capacity and creditworthiness.";
  } else if (concernCount <= 1 && strengthCount >= 2) {
    findings += "**System Recommendation:** APPROVED WITH CONDITIONS - Monitor existing loans and maintain consistent income.";
  } else if (concernCount > 1 || strengthCount < 2) {
    findings += "**System Recommendation:** FOR FURTHER EVALUATION - Additional documentation or clarification may be needed.";
  } else {
    findings += "**System Recommendation:** REQUIRES FURTHER INVESTIGATION - Recommend additional verification.";
  }

  return findings;
};

// Create new CI/BI Application
export const createCIBIApplication = async (req: Request, res: Response) => {
  try {
    const { investigator_id, branch_id, application_id, ...data } = req.body;
    const userId = (req as any).userId;

    // Auto-generate investigation findings if not provided
    let investigation_findings = data.investigation_findings;
    if (!investigation_findings && (data.monthly_income || data.credit_standing)) {
      investigation_findings = generateInvestigationFindings({
        monthly_income: data.monthly_income,
        estimated_monthly_expenses: data.estimated_monthly_expenses,
        existing_loan: data.existing_loan,
        previous_loans_status: data.previous_loans_status,
        credit_standing: data.credit_standing,
        capacity_to_pay: data.capacity_to_pay,
      });
    }

    const cibiApplication = await prisma.cibi_applications.create({
      data: {
        ...data,
        investigation_findings,
        investigator_id: investigator_id || userId,
        branch_id: branch_id || (req as any).userBranchId,
        status: "Draft",
      },
      include: {
        attachments: true,
        investigator: true,
        unit_applied: true,
      },
    });

    res.status(201).json(cibiApplication);
  } catch (error) {
    console.error("Error creating CI/BI application:", error);
    res.status(500).json({ error: "Failed to create CI/BI application" });
  }
};

// Get all CI/BI Applications
export const getAllCIBIApplications = async (req: Request, res: Response) => {
  try {
    const { branch_id, status, investigator_id } = req.query;
    const where: any = {};

    if (branch_id) where.branch_id = parseInt(branch_id as string);
    if (status) where.status = status;
    if (investigator_id) where.investigator_id = parseInt(investigator_id as string);

    const applications = await prisma.cibi_applications.findMany({
      where,
      include: {
        attachments: true,
        investigator: true,
        unit_applied: true,
        application: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching CI/BI applications:", error);
    res.status(500).json({ error: "Failed to fetch CI/BI applications" });
  }
};

// Get single CI/BI Application
export const getCIBIApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await prisma.cibi_applications.findUnique({
      where: { id: parseInt(id) },
      include: {
        attachments: true,
        investigator: true,
        unit_applied: true,
        application: true,
      },
    });

    if (!application) {
      return res.status(404).json({ error: "CI/BI application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Error fetching CI/BI application:", error);
    res.status(500).json({ error: "Failed to fetch CI/BI application" });
  }
};

// Update CI/BI Application
export const updateCIBIApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ...data } = req.body;

    // If key fields changed, regenerate findings
    if (data.monthly_income !== undefined || data.credit_standing !== undefined) {
      const existing = await prisma.cibi_applications.findUnique({
        where: { id: parseInt(id) },
      });

      if (existing) {
        const newFindings = generateInvestigationFindings({
          monthly_income: data.monthly_income || existing.monthly_income as any,
          estimated_monthly_expenses: data.estimated_monthly_expenses || existing.estimated_monthly_expenses as any,
          existing_loan: data.existing_loan !== undefined ? data.existing_loan : existing.existing_loan,
          previous_loans_status: data.previous_loans_status || existing.previous_loans_status || undefined,
          credit_standing: data.credit_standing || existing.credit_standing || undefined,
          capacity_to_pay: data.capacity_to_pay || existing.capacity_to_pay as any,
        });

        if (!data.investigation_findings) {
          data.investigation_findings = newFindings;
        }
      }
    }

    const application = await prisma.cibi_applications.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        attachments: true,
        investigator: true,
        unit_applied: true,
        application: true,
      },
    });

    res.json(application);
  } catch (error) {
    console.error("Error updating CI/BI application:", error);
    res.status(500).json({ error: "Failed to update CI/BI application" });
  }
};

// Delete CI/BI Application
export const deleteCIBIApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.cibi_applications.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "CI/BI application deleted successfully" });
  } catch (error) {
    console.error("Error deleting CI/BI application:", error);
    res.status(500).json({ error: "Failed to delete CI/BI application" });
  }
};

// Add attachment to CI/BI Application
export const addAttachment = async (req: Request, res: Response) => {
  try {
    const { cibi_application_id } = req.params;
    const userId = (req as any).userId;
    const { attachment_type, file_path, file_name, file_size } = req.body;

    const attachment = await prisma.cibi_attachments.create({
      data: {
        cibi_application_id: parseInt(cibi_application_id),
        attachment_type,
        file_path,
        file_name,
        file_size,
        uploaded_by: userId,
      },
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).json({ error: "Failed to add attachment" });
  }
};

// Remove attachment
export const removeAttachment = async (req: Request, res: Response) => {
  try {
    const { attachment_id } = req.params;

    await prisma.cibi_attachments.delete({
      where: { id: parseInt(attachment_id) },
    });

    res.json({ message: "Attachment removed successfully" });
  } catch (error) {
    console.error("Error removing attachment:", error);
    res.status(500).json({ error: "Failed to remove attachment" });
  }
};

// Update Application Status (from leads workflow)
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;
    const { status } = req.body;

    const application = await prisma.applications.update({
      where: { id: parseInt(application_id) },
      data: { status },
    });

    res.json(application);
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
};

// Create Application (initial submission)
export const createApplication = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const branchId = (req as any).userBranchId;
    const { applicant_name, applicant_phone, applicant_email } = req.body;

    const application = await prisma.applications.create({
      data: {
        applicant_name,
        applicant_phone,
        applicant_email,
        status: "Application",
        branch_id: branchId,
        created_by: userId,
      },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ error: "Failed to create application" });
  }
};

// Get all Applications (Leads)
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const { branch_id, status } = req.query;
    const where: any = {};

    if (branch_id) where.branch_id = parseInt(branch_id as string);
    if (status) where.status = status;

    const applications = await prisma.applications.findMany({
      where,
      include: {
        cibi_applications: true,
        branches: true,
        creator: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

// Get application by ID
export const getApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await prisma.applications.findUnique({
      where: { id: parseInt(id) },
      include: {
        cibi_applications: {
          include: {
            attachments: true,
            investigator: true,
          },
        },
        branches: true,
        creator: true,
      },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
};

// Get all available models from inventory
export const getModels = async (req: Request, res: Response) => {
  try {
    const models = await prisma.items.findMany({
      select: {
        id: true,
        item_no: true,
        brand: true,
        model: true,
        color: true,
        srp: true,
      },
      orderBy: { brand: "asc" },
    });

    res.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Failed to fetch models" });
  }
};
