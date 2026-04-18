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

    // Helper function to safely convert values
    const toNumber = (val: any): number | undefined => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const toDate = (val: any): Date | undefined => {
      if (!val) return undefined;
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date;
    };

    // Convert string values to proper types
    const processedData = {
      full_name: data.full_name || '',
      present_address: data.present_address,
      permanent_address: data.permanent_address,
      same_address: Boolean(data.same_address),
      date_of_birth: toDate(data.date_of_birth),
      civil_status: data.civil_status,
      valid_id: data.valid_id,
      tin_sss: data.tin_sss,
      employer_name: data.employer_name,
      position: data.position,
      length_of_service: data.length_of_service,
      monthly_income: toNumber(data.monthly_income),
      employer_address: data.employer_address,
      contact_person: data.contact_person,
      contact_person_phone: data.contact_person_phone,
      loan_type: data.loan_type || 'Motor Cycle Loan',
      unit_applied_id: toNumber(data.unit_applied_id),
      loan_amount: toNumber(data.loan_amount),
      down_payment: toNumber(data.down_payment),
      term_months: toNumber(data.term_months),
      monthly_amortization: toNumber(data.monthly_amortization),
      rebate: toNumber(data.rebate),
      existing_loan: Boolean(data.existing_loan),
      creditor_name: data.creditor_name,
      existing_loan_amount: toNumber(data.existing_loan_amount),
      existing_loan_status: data.existing_loan_status,
      previous_loans_status: data.previous_loans_status,
      credit_standing: data.credit_standing,
      residence_type: data.residence_type,
      length_of_stay: data.length_of_stay,
      verified_by: data.verified_by,
      residence_remarks: data.residence_remarks,
      reference_person: data.reference_person,
      reference_relationship: data.reference_relationship,
      reference_feedback: data.reference_feedback,
      estimated_monthly_expenses: toNumber(data.estimated_monthly_expenses),
      net_disposable_income: toNumber(data.net_disposable_income),
      capacity_to_pay: toNumber(data.capacity_to_pay),
      sufficient_capacity: Boolean(data.sufficient_capacity),
      comaker_name: data.comaker_name,
      comaker_relationship: data.comaker_relationship,
      comaker_contact: data.comaker_contact,
      comaker_financial_capacity: data.comaker_financial_capacity,
    };

    // Auto-generate investigation findings if not provided
    let investigation_findings = data.investigation_findings;
    let system_recommendation = data.system_recommendation;
    
    if (!investigation_findings && (processedData.monthly_income || data.credit_standing)) {
      investigation_findings = generateInvestigationFindings({
        monthly_income: processedData.monthly_income,
        estimated_monthly_expenses: processedData.estimated_monthly_expenses,
        existing_loan: processedData.existing_loan,
        previous_loans_status: processedData.previous_loans_status,
        credit_standing: processedData.credit_standing,
        capacity_to_pay: processedData.capacity_to_pay,
      });

      // Extract system recommendation from findings
      const recommendationMatch = investigation_findings.match(/\*\*System Recommendation:\*\*\s*([^-]+(?:-[^-]+)*)/);
      if (recommendationMatch) {
        system_recommendation = recommendationMatch[1].trim();
      }
    }

    const cibiApplication = await prisma.cibi_applications.create({
      data: {
        ...processedData,
        investigation_findings,
        system_recommendation: system_recommendation || data.system_recommendation,
        investigator_id: investigator_id || userId,
        branch_id: branch_id || (req as any).userBranchId,
        status: "Draft",
      },
      include: {
        attachments: true,
        investigator: {
          select: { id: true, username: true, name: true },
        },
        unit_applied: {
          select: { id: true, item_no: true, brand: true, model: true },
        },
      },
    });

    // Serialize Decimal fields
    const serialized = {
      ...cibiApplication,
      monthly_income: cibiApplication.monthly_income ? Number(cibiApplication.monthly_income) : null,
      loan_amount: cibiApplication.loan_amount ? Number(cibiApplication.loan_amount) : null,
      down_payment: cibiApplication.down_payment ? Number(cibiApplication.down_payment) : null,
      monthly_amortization: cibiApplication.monthly_amortization ? Number(cibiApplication.monthly_amortization) : null,
      rebate: cibiApplication.rebate ? Number(cibiApplication.rebate) : null,
      existing_loan_amount: cibiApplication.existing_loan_amount ? Number(cibiApplication.existing_loan_amount) : null,
      estimated_monthly_expenses: cibiApplication.estimated_monthly_expenses ? Number(cibiApplication.estimated_monthly_expenses) : null,
      net_disposable_income: cibiApplication.net_disposable_income ? Number(cibiApplication.net_disposable_income) : null,
      capacity_to_pay: cibiApplication.capacity_to_pay ? Number(cibiApplication.capacity_to_pay) : null,
    };

    res.status(201).json(serialized);
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
        investigator: {
          select: { id: true, username: true, name: true },
        },
        unit_applied: {
          select: { id: true, item_no: true, brand: true, model: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const serialized = applications.map((app: any) => ({
      ...app,
      monthly_income: app.monthly_income ? Number(app.monthly_income) : null,
      loan_amount: app.loan_amount ? Number(app.loan_amount) : null,
      down_payment: app.down_payment ? Number(app.down_payment) : null,
      monthly_amortization: app.monthly_amortization ? Number(app.monthly_amortization) : null,
      rebate: app.rebate ? Number(app.rebate) : null,
      existing_loan_amount: app.existing_loan_amount ? Number(app.existing_loan_amount) : null,
      estimated_monthly_expenses: app.estimated_monthly_expenses ? Number(app.estimated_monthly_expenses) : null,
      net_disposable_income: app.net_disposable_income ? Number(app.net_disposable_income) : null,
      capacity_to_pay: app.capacity_to_pay ? Number(app.capacity_to_pay) : null,
    }));

    res.json(serialized);
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
        investigator: {
          select: { id: true, username: true, name: true },
        },
        unit_applied: {
          select: { id: true, item_no: true, brand: true, model: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "CI/BI application not found" });
    }

    // Serialize Decimal fields
    const serialized = {
      ...application,
      monthly_income: application.monthly_income ? Number(application.monthly_income) : null,
      loan_amount: application.loan_amount ? Number(application.loan_amount) : null,
      down_payment: application.down_payment ? Number(application.down_payment) : null,
      monthly_amortization: application.monthly_amortization ? Number(application.monthly_amortization) : null,
      rebate: application.rebate ? Number(application.rebate) : null,
      existing_loan_amount: application.existing_loan_amount ? Number(application.existing_loan_amount) : null,
      estimated_monthly_expenses: application.estimated_monthly_expenses ? Number(application.estimated_monthly_expenses) : null,
      net_disposable_income: application.net_disposable_income ? Number(application.net_disposable_income) : null,
      capacity_to_pay: application.capacity_to_pay ? Number(application.capacity_to_pay) : null,
    };

    res.json(serialized);
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

    // Helper function to safely convert values
    const toNumber = (val: any): number | undefined => {
      if (val === null || val === undefined || val === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const toDate = (val: any): Date | undefined => {
      if (!val) return undefined;
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date;
    };

    // Convert string values to proper types
    const processedData: any = {};
    
    // Map and convert each field if present
    if (data.full_name !== undefined) processedData.full_name = data.full_name;
    if (data.present_address !== undefined) processedData.present_address = data.present_address;
    if (data.permanent_address !== undefined) processedData.permanent_address = data.permanent_address;
    if (data.same_address !== undefined) processedData.same_address = Boolean(data.same_address);
    if (data.date_of_birth !== undefined) processedData.date_of_birth = toDate(data.date_of_birth);
    if (data.civil_status !== undefined) processedData.civil_status = data.civil_status;
    if (data.valid_id !== undefined) processedData.valid_id = data.valid_id;
    if (data.tin_sss !== undefined) processedData.tin_sss = data.tin_sss;
    if (data.employer_name !== undefined) processedData.employer_name = data.employer_name;
    if (data.position !== undefined) processedData.position = data.position;
    if (data.length_of_service !== undefined) processedData.length_of_service = data.length_of_service;
    if (data.monthly_income !== undefined) processedData.monthly_income = toNumber(data.monthly_income);
    if (data.employer_address !== undefined) processedData.employer_address = data.employer_address;
    if (data.contact_person !== undefined) processedData.contact_person = data.contact_person;
    if (data.contact_person_phone !== undefined) processedData.contact_person_phone = data.contact_person_phone;
    if (data.loan_type !== undefined) processedData.loan_type = data.loan_type;
    if (data.unit_applied_id !== undefined) processedData.unit_applied_id = toNumber(data.unit_applied_id);
    if (data.loan_amount !== undefined) processedData.loan_amount = toNumber(data.loan_amount);
    if (data.down_payment !== undefined) processedData.down_payment = toNumber(data.down_payment);
    if (data.term_months !== undefined) processedData.term_months = toNumber(data.term_months);
    if (data.monthly_amortization !== undefined) processedData.monthly_amortization = toNumber(data.monthly_amortization);
    if (data.rebate !== undefined) processedData.rebate = toNumber(data.rebate);
    if (data.existing_loan !== undefined) processedData.existing_loan = Boolean(data.existing_loan);
    if (data.creditor_name !== undefined) processedData.creditor_name = data.creditor_name;
    if (data.existing_loan_amount !== undefined) processedData.existing_loan_amount = toNumber(data.existing_loan_amount);
    if (data.existing_loan_status !== undefined) processedData.existing_loan_status = data.existing_loan_status;
    if (data.previous_loans_status !== undefined) processedData.previous_loans_status = data.previous_loans_status;
    if (data.credit_standing !== undefined) processedData.credit_standing = data.credit_standing;
    if (data.residence_type !== undefined) processedData.residence_type = data.residence_type;
    if (data.length_of_stay !== undefined) processedData.length_of_stay = data.length_of_stay;
    if (data.verified_by !== undefined) processedData.verified_by = data.verified_by;
    if (data.residence_remarks !== undefined) processedData.residence_remarks = data.residence_remarks;
    if (data.reference_person !== undefined) processedData.reference_person = data.reference_person;
    if (data.reference_relationship !== undefined) processedData.reference_relationship = data.reference_relationship;
    if (data.reference_feedback !== undefined) processedData.reference_feedback = data.reference_feedback;
    if (data.estimated_monthly_expenses !== undefined) processedData.estimated_monthly_expenses = toNumber(data.estimated_monthly_expenses);
    if (data.net_disposable_income !== undefined) processedData.net_disposable_income = toNumber(data.net_disposable_income);
    if (data.capacity_to_pay !== undefined) processedData.capacity_to_pay = toNumber(data.capacity_to_pay);
    if (data.sufficient_capacity !== undefined) processedData.sufficient_capacity = Boolean(data.sufficient_capacity);
    if (data.comaker_name !== undefined) processedData.comaker_name = data.comaker_name;
    if (data.comaker_relationship !== undefined) processedData.comaker_relationship = data.comaker_relationship;
    if (data.comaker_contact !== undefined) processedData.comaker_contact = data.comaker_contact;
    if (data.comaker_financial_capacity !== undefined) processedData.comaker_financial_capacity = data.comaker_financial_capacity;
    if (data.investigation_findings !== undefined) processedData.investigation_findings = data.investigation_findings;
    if (data.system_recommendation !== undefined) processedData.system_recommendation = data.system_recommendation;
    if (data.manual_recommendation !== undefined) processedData.manual_recommendation = data.manual_recommendation;
    if (data.recommendation_remarks !== undefined) processedData.recommendation_remarks = data.recommendation_remarks;
    if (data.investigator_id !== undefined) processedData.investigator_id = toNumber(data.investigator_id);
    if (data.investigator_signature !== undefined) processedData.investigator_signature = data.investigator_signature;
    if (data.status !== undefined) processedData.status = data.status;

    // If key fields changed, regenerate findings
    if (data.monthly_income !== undefined || data.credit_standing !== undefined) {
      const existing = await prisma.cibi_applications.findUnique({
        where: { id: parseInt(id) },
      });

      if (existing) {
        const newFindings = generateInvestigationFindings({
          monthly_income: processedData.monthly_income !== undefined ? processedData.monthly_income : existing.monthly_income as any,
          estimated_monthly_expenses: processedData.estimated_monthly_expenses !== undefined ? processedData.estimated_monthly_expenses : existing.estimated_monthly_expenses as any,
          existing_loan: processedData.existing_loan !== undefined ? processedData.existing_loan : existing.existing_loan,
          previous_loans_status: processedData.previous_loans_status !== undefined ? processedData.previous_loans_status : existing.previous_loans_status || undefined,
          credit_standing: processedData.credit_standing !== undefined ? processedData.credit_standing : existing.credit_standing || undefined,
          capacity_to_pay: processedData.capacity_to_pay !== undefined ? processedData.capacity_to_pay : existing.capacity_to_pay as any,
        });

        if (!processedData.investigation_findings) {
          processedData.investigation_findings = newFindings;
        }

        // Extract system recommendation from findings
        const recommendationMatch = newFindings.match(/\*\*System Recommendation:\*\*\s*([^-]+(?:-[^-]+)*)/);
        if (recommendationMatch && !processedData.system_recommendation) {
          processedData.system_recommendation = recommendationMatch[1].trim();
        }
      }
    }

    const application = await prisma.cibi_applications.update({
      where: { id: parseInt(id) },
      data: {
        ...processedData,
        updated_at: new Date(),
      },
      include: {
        attachments: true,
        investigator: {
          select: { id: true, username: true, name: true },
        },
        unit_applied: {
          select: { id: true, item_no: true, brand: true, model: true },
        },
      },
    });

    // Serialize Decimal fields
    const serialized = {
      ...application,
      monthly_income: application.monthly_income ? Number(application.monthly_income) : null,
      loan_amount: application.loan_amount ? Number(application.loan_amount) : null,
      down_payment: application.down_payment ? Number(application.down_payment) : null,
      monthly_amortization: application.monthly_amortization ? Number(application.monthly_amortization) : null,
      rebate: application.rebate ? Number(application.rebate) : null,
      existing_loan_amount: application.existing_loan_amount ? Number(application.existing_loan_amount) : null,
      estimated_monthly_expenses: application.estimated_monthly_expenses ? Number(application.estimated_monthly_expenses) : null,
      net_disposable_income: application.net_disposable_income ? Number(application.net_disposable_income) : null,
      capacity_to_pay: application.capacity_to_pay ? Number(application.capacity_to_pay) : null,
    };

    res.json(serialized);
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
