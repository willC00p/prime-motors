import prisma from './backend/src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function createTables() {
  try {
    const sqlPath = path.join(__dirname, 'create_cibi_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
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
