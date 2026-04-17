export interface CIBIApplicationRequest {
  // Applicant Info
  full_name: string;
  present_address?: string;
  permanent_address?: string;
  same_address?: boolean;
  date_of_birth?: string;
  civil_status?: string;
  valid_id?: string;
  tin_sss?: string;

  // Employment / Source of Income
  employer_name?: string;
  position?: string;
  length_of_service?: string;
  monthly_income?: number;
  employer_address?: string;
  contact_person?: string;
  contact_person_phone?: string;

  // Loan Details
  loan_type?: string;
  unit_applied_id?: number;
  loan_amount?: number;
  down_payment?: number;
  term_months?: number;
  monthly_amortization?: number;
  rebate?: number;

  // Credit Background
  existing_loan?: boolean;
  creditor_name?: string;
  existing_loan_amount?: number;
  existing_loan_status?: string;
  previous_loans_status?: string;
  credit_standing?: string;

  // Residence Verification
  residence_type?: string;
  length_of_stay?: string;
  verified_by?: string;
  residence_remarks?: string;

  // Character and Neighborhood Check
  reference_person?: string;
  reference_relationship?: string;
  reference_feedback?: string;

  // Financial Capacity
  estimated_monthly_expenses?: number;
  net_disposable_income?: number;
  capacity_to_pay?: number;
  sufficient_capacity?: boolean;

  // Collateral / Comaker
  comaker_name?: string;
  comaker_relationship?: string;
  comaker_contact?: string;
  comaker_financial_capacity?: string;

  // Investigation Findings
  investigation_findings?: string;

  // Recommendation
  system_recommendation?: string;
  manual_recommendation?: string;
  recommendation_remarks?: string;

  // Prepared By
  investigator_id?: number;
  investigator_signature?: string;

  // Status
  status?: string;
  application_id?: number;
  branch_id?: number;
}

export interface CIBIApplicationResponse extends CIBIApplicationRequest {
  id: number;
  prepared_date: Date;
  created_at: Date;
  updated_at: Date;
  attachments?: CIBIAttachmentResponse[];
}

export interface CIBIAttachmentRequest {
  attachment_type: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  uploaded_by?: number;
}

export interface CIBIAttachmentResponse extends CIBIAttachmentRequest {
  id: number;
  cibi_application_id: number;
  uploaded_at: Date;
}

export interface ApplicationRequest {
  applicant_name: string;
  applicant_phone?: string;
  applicant_email?: string;
  status?: string;
  branch_id?: number;
  created_by?: number;
}

export interface ApplicationResponse extends ApplicationRequest {
  id: number;
  date_submitted: Date;
  created_at: Date;
  updated_at: Date;
}

export interface InvestigationFindingsParams {
  monthly_income?: number;
  estimated_monthly_expenses?: number;
  existing_loan?: boolean;
  previous_loans_status?: string;
  credit_standing?: string;
  capacity_to_pay?: number;
}
