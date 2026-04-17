-- Create CI/BI Applications Table
CREATE TABLE IF NOT EXISTS cibi_applications (
  id SERIAL PRIMARY KEY,
  
  -- Applicant Info
  full_name VARCHAR(255) NOT NULL,
  present_address VARCHAR(500),
  permanent_address VARCHAR(500),
  same_address BOOLEAN DEFAULT false,
  date_of_birth DATE,
  civil_status VARCHAR(50),
  valid_id VARCHAR(100),
  tin_sss VARCHAR(50),
  
  -- Employment / Source of Income
  employer_name VARCHAR(255),
  position VARCHAR(255),
  length_of_service VARCHAR(100),
  monthly_income DECIMAL(12,2),
  employer_address VARCHAR(500),
  contact_person VARCHAR(255),
  contact_person_phone VARCHAR(20),
  
  -- Loan Details
  loan_type VARCHAR(100) DEFAULT 'Motor Cycle Loan',
  unit_applied_id INTEGER,
  loan_amount DECIMAL(12,2),
  down_payment DECIMAL(12,2),
  term_months INTEGER,
  monthly_amortization DECIMAL(12,2),
  rebate DECIMAL(12,2),
  
  -- Credit Background
  existing_loan BOOLEAN,
  creditor_name VARCHAR(255),
  existing_loan_amount DECIMAL(12,2),
  existing_loan_status VARCHAR(50), -- Updated, Past Due, N/A
  previous_loans_status VARCHAR(50), -- Paid, Unpaid, Defaulted
  credit_standing VARCHAR(50), -- Good, Bad
  
  -- Residence Verification
  residence_type VARCHAR(50), -- Owned, Rented, Living with Relatives
  length_of_stay VARCHAR(100),
  verified_by VARCHAR(255),
  residence_remarks TEXT,
  
  -- Character and Neighborhood Check
  reference_person VARCHAR(255),
  reference_relationship VARCHAR(100),
  reference_feedback TEXT,
  
  -- Financial Capacity
  estimated_monthly_expenses DECIMAL(12,2),
  net_disposable_income DECIMAL(12,2),
  capacity_to_pay DECIMAL(12,2),
  sufficient_capacity BOOLEAN,
  
  -- Collateral / Comaker
  comaker_name VARCHAR(255),
  comaker_relationship VARCHAR(100),
  comaker_contact VARCHAR(500),
  comaker_financial_capacity TEXT,
  
  -- Investigation Findings
  investigation_findings TEXT,
  
  -- Recommendation
  system_recommendation VARCHAR(50),
  manual_recommendation VARCHAR(50), -- Approved, Disapproved, For Further Evaluation
  recommendation_remarks TEXT,
  
  -- Prepared By
  investigator_id INTEGER REFERENCES users(id),
  investigator_signature VARCHAR(500),
  prepared_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, In Review, Approved, Disapproved, For Further Evaluation
  application_id INTEGER,
  branch_id INTEGER REFERENCES branches(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (unit_applied_id) REFERENCES items(id),
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

-- Create CI/BI Attachments Table
CREATE TABLE IF NOT EXISTS cibi_attachments (
  id SERIAL PRIMARY KEY,
  cibi_application_id INTEGER NOT NULL REFERENCES cibi_applications(id) ON DELETE CASCADE,
  attachment_type VARCHAR(100), -- Inside House, Outside House, Neighborhood Sketch, Barangay Verification, Valid ID, Proof of Income, Remittance
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER REFERENCES users(id)
);

-- Create Applications Table (if not exists) for capturing leads
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(20),
  applicant_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Application', -- Application, Leads, Submit Requirements, CI/BI, Result, Submit to Head Office, Submit to Branch, Notify Client, Releasing Units
  date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  branch_id INTEGER REFERENCES branches(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add department and investigator_role to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS investigator_role BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cibi_applications_status ON cibi_applications(status);
CREATE INDEX IF NOT EXISTS idx_cibi_applications_branch ON cibi_applications(branch_id);
CREATE INDEX IF NOT EXISTS idx_cibi_applications_investigator ON cibi_applications(investigator_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_branch ON applications(branch_id);
