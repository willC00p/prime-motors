-- Add workflow tracking columns to applications table

ALTER TABLE "applications" ADD COLUMN "workflow_status" VARCHAR(50) NOT NULL DEFAULT 'APPLICATION';
ALTER TABLE "applications" ADD COLUMN "leads_entered_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "requirements_submitted_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "requirements_status" VARCHAR(50);
ALTER TABLE "applications" ADD COLUMN "cibi_started_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "cibi_completed_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "cibi_result" VARCHAR(50);
ALTER TABLE "applications" ADD COLUMN "cibi_sla_exceeded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "applications" ADD COLUMN "cibi_penalty_amount" DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE "applications" ADD COLUMN "head_office_submitted_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "branch_submitted_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "branch_approved_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "client_notified_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "unit_released_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "sales_encoded_at" TIMESTAMPTZ(6);
ALTER TABLE "applications" ADD COLUMN "assigned_investigator_id" INTEGER;
ALTER TABLE "applications" ADD COLUMN "notes" TEXT;

-- Add foreign key for investigator
ALTER TABLE "applications" ADD CONSTRAINT "applications_assigned_investigator_fkey" 
FOREIGN KEY ("assigned_investigator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for workflow tracking
CREATE INDEX "idx_applications_workflow_status" ON "applications"("workflow_status");
CREATE INDEX "idx_applications_sla_exceeded" ON "applications"("cibi_sla_exceeded");
