import prisma from '../src/lib/prisma';

async function createApplicationsTable() {
  try {
    console.log('📝 Creating applications table linked to CI/BI applications...\n');

    const createTableSQL = `
CREATE TABLE IF NOT EXISTS "applications" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "applicant_name" VARCHAR(255) NOT NULL,
  "applicant_phone" VARCHAR(20),
  "applicant_email" VARCHAR(255),
  "status" VARCHAR(50) NOT NULL DEFAULT 'Application',
  "date_submitted" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "branch_id" INTEGER,
  "created_by" INTEGER,
  "workflow_status" VARCHAR(50) NOT NULL DEFAULT 'APPLICATION',
  "leads_entered_at" TIMESTAMPTZ(6),
  "requirements_submitted_at" TIMESTAMPTZ(6),
  "requirements_status" VARCHAR(50),
  "cibi_started_at" TIMESTAMPTZ(6),
  "cibi_completed_at" TIMESTAMPTZ(6),
  "cibi_result" VARCHAR(50),
  "cibi_sla_exceeded" BOOLEAN NOT NULL DEFAULT false,
  "cibi_penalty_amount" DECIMAL(12, 2) DEFAULT 0,
  "head_office_submitted_at" TIMESTAMPTZ(6),
  "branch_submitted_at" TIMESTAMPTZ(6),
  "branch_approved_at" TIMESTAMPTZ(6),
  "client_notified_at" TIMESTAMPTZ(6),
  "unit_released_at" TIMESTAMPTZ(6),
  "sales_encoded_at" TIMESTAMPTZ(6),
  "assigned_investigator_id" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "applications_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "applications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "applications_assigned_investigator_fkey" FOREIGN KEY ("assigned_investigator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
`;

    await prisma.$executeRawUnsafe(createTableSQL);
    console.log('✅ Applications table created successfully');

    // Add foreign key from cibi_applications to applications if not exists
    console.log('\n🔗 Linking CI/BI applications to applications table...');
    try {
      const fkSQL = `
ALTER TABLE "cibi_applications" 
ADD CONSTRAINT "cibi_applications_application_id_fkey" 
FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;
      await prisma.$executeRawUnsafe(fkSQL);
      console.log('✅ Foreign key constraint added');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Foreign key already exists');
      } else if (error.message?.includes('duplicate key')) {
        console.log('⚠️  Constraint already exists');
      } else {
        console.log('⚠️  Could not add FK (may already exist):', error.message?.substring(0, 100));
      }
    }

    // Create indexes
    console.log('\n📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "idx_applications_workflow_status" ON "applications"("workflow_status")',
      'CREATE INDEX IF NOT EXISTS "idx_applications_sla_exceeded" ON "applications"("cibi_sla_exceeded")',
      'CREATE INDEX IF NOT EXISTS "idx_applications_status" ON "applications"("status")',
      'CREATE INDEX IF NOT EXISTS "idx_applications_branch" ON "applications"("branch_id")',
    ];

    for (const idx of indexes) {
      try {
        await prisma.$executeRawUnsafe(idx);
        console.log(`✅ ${idx.substring(0, 70)}...`);
      } catch (error: any) {
        console.log(`⚠️  Index already exists or skipped`);
      }
    }

    console.log('\n✅ Applications table fully configured with workflow tracking!');
    console.log('📌 This table is now linked to CI/BI applications for workflow monitoring.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createApplicationsTable();
