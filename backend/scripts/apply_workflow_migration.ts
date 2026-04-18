import prisma from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function applyWorkflowMigration() {
  try {
    console.log('Applying workflow tracking migration...');

    const migrationSql = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/20250418_add_workflow_tracking/migration.sql'),
      'utf-8'
    );

    // Split by semicolon and filter empty statements
    const statements = migrationSql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    let executed = 0;
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement + ';');
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        executed++;
      } catch (error: any) {
        // Ignore errors for already-existing columns/indexes
        if (
          error.message?.includes('already exists') ||
          error.message?.includes('duplicate key') ||
          error.message?.includes('column') ||
          error.meta?.code === '42701' // column already exists
        ) {
          console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
        } else {
          console.error(`❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log(`\n✅ Migration complete! Applied ${executed} statements.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyWorkflowMigration();
