-- Add detailed workflow fields to applications table
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_investigation_status" VARCHAR(50);
-- Values: IN_PROGRESS, APPROVED, DISAPPROVED, FURTHER_EVALUATION

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_investigation_notes" TEXT;

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_approved" BOOLEAN DEFAULT FALSE;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_notes" TEXT;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_approved_by" INTEGER;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_approved_at" TIMESTAMPTZ(6);

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_status" VARCHAR(50);
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_notes" TEXT;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_approved_by" INTEGER;

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "client_notification_status" VARCHAR(50);
-- Values: NOTIFIED, CLIENT_RESPONDED, CLIENT_NOT_RESPONDING

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "unit_release_status" VARCHAR(50);
-- Values: NOT_YET_RELEASED, RELEASED, DELIVERED

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "sales_data" JSONB;

ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "lead_completed_at" TIMESTAMPTZ(6);

-- Add foreign keys for approvers
ALTER TABLE "applications" ADD CONSTRAINT "fk_head_office_approver" 
  FOREIGN KEY ("head_office_approved_by") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "applications" ADD CONSTRAINT "fk_branch_approver" 
  FOREIGN KEY ("branch_approved_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- Create attachments table for requirements files
CREATE TABLE IF NOT EXISTS "requirement_attachments" (
  "id" SERIAL PRIMARY KEY,
  "application_id" INTEGER NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "file_url" VARCHAR(500),
  "file_key" VARCHAR(500),
  "file_type" VARCHAR(50),
  "file_size" INTEGER,
  "upload_type" VARCHAR(50),
  -- Values: PARTIAL, COMPLETE
  "uploaded_by" INTEGER,
  "uploaded_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  CONSTRAINT "fk_attachments_app" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_attachments_user" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_requirement_attachments_app" ON "requirement_attachments"("application_id");
