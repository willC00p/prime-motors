import prisma from '../src/lib/prisma';

async function applyWorkflowDetailsMigration() {
  try {
    console.log('⏳ Applying workflow details migration...');
    
    // Execute each migration step individually
    const migrations = [
      // Add CI/BI investigation fields
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_investigation_status" VARCHAR(50)`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cibi_investigation_notes" TEXT`,
      
      // Add head office approval fields
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_approved" BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_notes" TEXT`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_approved_by" INTEGER`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "head_office_approved_at" TIMESTAMPTZ(6)`,
      
      // Add branch approval fields
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_status" VARCHAR(50)`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_notes" TEXT`,
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "branch_approved_by" INTEGER`,
      
      // Add client notification fields
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "client_notification_status" VARCHAR(50)`,
      
      // Add unit release fields
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "unit_release_status" VARCHAR(50)`,
      
      // Add sales encoding fields
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "sales_data" JSONB`,
      
      // Add completion fields
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "lead_completed_at" TIMESTAMPTZ(6)`,
    ];

    for (const migration of migrations) {
      try {
        await prisma.$executeRawUnsafe(migration);
        console.log(`✅ ${migration.substring(0, 60)}...`);
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`ℹ️  Already exists: ${migration.substring(0, 60)}`);
        } else {
          console.error(`❌ Error: ${migration.substring(0, 60)}`);
          console.error(error);
        }
      }
    }

    // Add foreign keys
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "applications" ADD CONSTRAINT "fk_head_office_approver" 
        FOREIGN KEY ("head_office_approved_by") REFERENCES "users"("id") ON DELETE SET NULL
      `);
      console.log('✅ Head office approver foreign key added');
    } catch (error) {
      console.log('ℹ️  Head office approver FK may already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "applications" ADD CONSTRAINT "fk_branch_approver" 
        FOREIGN KEY ("branch_approved_by") REFERENCES "users"("id") ON DELETE SET NULL
      `);
      console.log('✅ Branch approver foreign key added');
    } catch (error) {
      console.log('ℹ️  Branch approver FK may already exist');
    }

    // Create requirement_attachments table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "requirement_attachments" (
          "id" SERIAL PRIMARY KEY,
          "application_id" INTEGER NOT NULL,
          "file_name" VARCHAR(255) NOT NULL,
          "file_url" VARCHAR(500),
          "file_key" VARCHAR(500),
          "file_type" VARCHAR(50),
          "file_size" INTEGER,
          "upload_type" VARCHAR(50),
          "uploaded_by" INTEGER,
          "uploaded_at" TIMESTAMPTZ(6) DEFAULT NOW(),
          "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
          CONSTRAINT "fk_attachments_app" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE,
          CONSTRAINT "fk_attachments_user" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL
        )
      `);
      console.log('✅ requirement_attachments table created');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  requirement_attachments table already exists');
      } else {
        console.error('❌ Error creating requirement_attachments:', error);
      }
    }

    // Create index
    try {
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "idx_requirement_attachments_app" ON "requirement_attachments"("application_id")`
      );
      console.log('✅ Index on requirement_attachments created');
    } catch (error) {
      console.log('ℹ️  Index may already exist');
    }

    console.log('\n✅ Workflow details migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyWorkflowDetailsMigration();
