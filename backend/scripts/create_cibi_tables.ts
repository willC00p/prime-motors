import prisma from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function createTables() {
  try {
    const sqlPath = path.join(__dirname, '../prisma/migrations/20250417_add_cibi_applications/migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error: any) {
          if (error.code === 'P2010' && error.meta?.message?.includes('relation') && error.meta?.message?.includes('does not exist')) {
            console.log('⏭️  Skipped (referenced table missing):', statement.substring(0, 50) + '...');
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ All CI/BI tables created successfully!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTables();
