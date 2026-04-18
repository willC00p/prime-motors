import prisma from '../src/lib/prisma';

/**
 * Migration script to link existing CI/BI applications to the applications table
 * Run: npx ts-node scripts/link_cibi_to_applications.ts
 */
async function main() {
  try {
    console.log('Starting migration to link CI/BI applications to applications table...');

    // Get all CI/BI applications that don't have an application_id
    const cibiApps = await prisma.cibi_applications.findMany({
      where: {
        application_id: null,
      },
    });

    console.log(`Found ${cibiApps.length} CI/BI applications without application links`);

    let created = 0;
    let errors = 0;

    for (const cibiApp of cibiApps) {
      try {
        // Create application record
        const application = await prisma.applications.create({
          data: {
            applicant_name: cibiApp.full_name || 'Unknown',
            applicant_phone: cibiApp.contact_person_phone,
            applicant_email: undefined,
            branch_id: cibiApp.branch_id,
            created_by: cibiApp.investigator_id,
            workflow_status: 'CI_BI',
            cibi_started_at: cibiApp.prepared_date,
            assigned_investigator_id: cibiApp.investigator_id,
            status: cibiApp.status === 'Approved' ? 'Approved' : 'Pending',
          },
        });

        // Link CI/BI application to applications table
        await prisma.cibi_applications.update({
          where: { id: cibiApp.id },
          data: { application_id: application.id },
        });

        created++;
        console.log(`✅ Created application link for CI/BI ID ${cibiApp.id}`);
      } catch (error) {
        errors++;
        console.error(`❌ Failed to link CI/BI ID ${cibiApp.id}:`, error);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`✅ Created ${created} application records`);
    console.log(`❌ Failed ${errors} links`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
