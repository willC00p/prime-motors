import prisma from '../src/lib/prisma';

async function applyWorkflowMigration() {
  try {
    console.log('🔄 Applying workflow tracking schema to hosted database...\n');

    const statements = [
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "workflow_status" VARCHAR(50) NOT NULL DEFAULT \'APPLICATION\'',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "leads_entered_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "requirements_submitted_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "requirements_status" VARCHAR(50)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_started_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_completed_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_result" VARCHAR(50)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_sla_exceeded" BOOLEAN NOT NULL DEFAULT false',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_penalty_amount" DECIMAL(12, 2) DEFAULT 0',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_submitted_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_submitted_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_approved_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "client_notified_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "unit_released_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "sales_encoded_at" TIMESTAMPTZ(6)',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "assigned_investigator_id" INTEGER',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "notes" TEXT',
    ];

    let completed = 0;
    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
        console.log(`✅ ${stmt.substring(0, 60)}...`);
        completed++;
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`⚠️  Already exists: ${stmt.substring(0, 60)}...`);
          completed++;
        } else {
          console.error(`❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log(`\n📝 Adding foreign key constraint...`);
    try {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "applications" ADD CONSTRAINT "applications_assigned_investigator_fkey" ' +
        'FOREIGN KEY ("assigned_investigator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE'
      );
      console.log(`✅ Foreign key constraint added`);
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  Constraint already exists`);
      } else {
        console.error(`⚠️  Could not add foreign key (may already exist): ${error.message}`);
      }
    }

    console.log(`\n📊 Creating indexes...`);
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "idx_applications_workflow_status" ON "applications"("workflow_status")',
      'CREATE INDEX IF NOT EXISTS "idx_applications_sla_exceeded" ON "applications"("cibi_sla_exceeded")',
    ];

    for (const idx of indexes) {
      try {
        await prisma.$executeRawUnsafe(idx);
        console.log(`✅ ${idx.substring(0, 60)}...`);
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`⚠️  ${idx.substring(0, 60)}... (already exists)`);
        } else {
          console.error(`⚠️  Could not create index: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Migration complete! ${completed} columns added/verified.`);
    console.log(`\n📋 Verifying schema...`);
    
    const result = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'applications' AND column_name LIKE '%workflow%' OR column_name LIKE '%cibi%' OR column_name = 'assigned_investigator_id'`
    );
    
    console.log(`Found ${(result as any[]).length} workflow-related columns in applications table`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

applyWorkflowMigration();
