import prisma from '../src/lib/prisma';

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Get all tables
    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );

    console.log('📊 Tables in public schema:');
    (tables as any[]).forEach(t => console.log(`  - ${t.table_name}`));

    // Check if applications table exists
    const appExists = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'applications'
      )`
    );

    console.log(`\n✓ Applications table exists: ${(appExists as any)[0].exists}`);

    if ((appExists as any)[0].exists) {
      // Get columns in applications table
      const columns = await prisma.$queryRawUnsafe(
        `SELECT column_name, data_type FROM information_schema.columns 
         WHERE table_name = 'applications' 
         ORDER BY column_name`
      );
      console.log('\n📋 Columns in applications table:');
      (columns as any[]).forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSchema();
