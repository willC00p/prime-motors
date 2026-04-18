-- CreateTable cibi_applications
CREATE TABLE "cibi_applications" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "present_address" TEXT,
    "permanent_address" TEXT,
    "same_address" BOOLEAN NOT NULL DEFAULT false,
    "date_of_birth" DATE,
    "civil_status" VARCHAR(50),
    "valid_id" VARCHAR(100),
    "tin_sss" VARCHAR(50),
    "employer_name" VARCHAR(255),
    "position" VARCHAR(255),
    "length_of_service" VARCHAR(100),
    "monthly_income" DECIMAL(12,2),
    "employer_address" TEXT,
    "contact_person" VARCHAR(255),
    "contact_person_phone" VARCHAR(20),
    "loan_type" VARCHAR(100) NOT NULL DEFAULT 'Motor Cycle Loan',
    "unit_applied_id" INTEGER,
    "loan_amount" DECIMAL(12,2),
    "down_payment" DECIMAL(12,2),
    "term_months" INTEGER,
    "monthly_amortization" DECIMAL(12,2),
    "rebate" DECIMAL(12,2),
    "existing_loan" BOOLEAN,
    "creditor_name" VARCHAR(255),
    "existing_loan_amount" DECIMAL(12,2),
    "existing_loan_status" VARCHAR(50),
    "previous_loans_status" VARCHAR(50),
    "credit_standing" VARCHAR(50),
    "residence_type" VARCHAR(50),
    "length_of_stay" VARCHAR(100),
    "verified_by" VARCHAR(255),
    "residence_remarks" TEXT,
    "reference_person" VARCHAR(255),
    "reference_relationship" VARCHAR(100),
    "reference_feedback" TEXT,
    "estimated_monthly_expenses" DECIMAL(12,2),
    "net_disposable_income" DECIMAL(12,2),
    "capacity_to_pay" DECIMAL(12,2),
    "sufficient_capacity" BOOLEAN,
    "comaker_name" VARCHAR(255),
    "comaker_relationship" VARCHAR(100),
    "comaker_contact" TEXT,
    "comaker_financial_capacity" TEXT,
    "investigation_findings" TEXT,
    "system_recommendation" VARCHAR(50),
    "manual_recommendation" VARCHAR(50),
    "recommendation_remarks" TEXT,
    "investigator_id" INTEGER,
    "investigator_signature" VARCHAR(500),
    "prepared_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Draft',
    "application_id" INTEGER,
    "branch_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cibi_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable cibi_attachments
CREATE TABLE "cibi_attachments" (
    "id" SERIAL NOT NULL,
    "cibi_application_id" INTEGER NOT NULL,
    "attachment_type" VARCHAR(100),
    "file_path" VARCHAR(500),
    "file_name" VARCHAR(255),
    "file_size" INTEGER,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" INTEGER,

    CONSTRAINT "cibi_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cibi_applications_status" ON "cibi_applications"("status");

-- CreateIndex
CREATE INDEX "idx_cibi_applications_branch" ON "cibi_applications"("branch_id");

-- CreateIndex
CREATE INDEX "idx_cibi_applications_investigator" ON "cibi_applications"("investigator_id");

-- CreateIndex
CREATE INDEX "cibi_attachments_cibi_application_id_idx" ON "cibi_attachments"("cibi_application_id");

-- AddForeignKey
ALTER TABLE "cibi_applications" ADD CONSTRAINT "cibi_applications_unit_applied_id_fkey" FOREIGN KEY ("unit_applied_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cibi_applications" ADD CONSTRAINT "cibi_applications_investigator_id_fkey" FOREIGN KEY ("investigator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cibi_applications" ADD CONSTRAINT "cibi_applications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cibi_applications" ADD CONSTRAINT "cibi_applications_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cibi_attachments" ADD CONSTRAINT "cibi_attachments_cibi_application_id_fkey" FOREIGN KEY ("cibi_application_id") REFERENCES "cibi_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cibi_attachments" ADD CONSTRAINT "cibi_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
