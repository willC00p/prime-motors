import prisma from '../src/lib/prisma';

/**
 * Check CI/BI SLA and apply penalties
 * Run this script periodically (e.g., every hour) to update SLA statuses
 */
async function checkSLA() {
  try {
    console.log('Starting CI/BI SLA check...');

    const SLA_HOURS = 24;
    const SLA_PENALTY_PER_HOUR = 100; // ₱100 per hour exceeded

    // Find all applications with completed CI/BI that haven't been checked for SLA yet
    const applications = await prisma.applications.findMany({
      where: {
        cibi_completed_at: { not: null },
        cibi_sla_exceeded: false, // Not yet marked as exceeded
      },
      select: {
        id: true,
        applicant_name: true,
        cibi_started_at: true,
        cibi_completed_at: true,
        workflow_status: true,
      },
    });

    console.log(`Found ${applications.length} applications to check`);

    let updated = 0;
    let penalties_applied = 0;

    for (const app of applications) {
      if (app.cibi_started_at && app.cibi_completed_at) {
        const timeDiff = app.cibi_completed_at.getTime() - app.cibi_started_at.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        console.log(
          `App ${app.id} (${app.applicant_name}): ${hoursDiff.toFixed(2)} hours`
        );

        if (hoursDiff > SLA_HOURS) {
          const hoursExceeded = Math.ceil(hoursDiff - SLA_HOURS);
          const penalty = hoursExceeded * SLA_PENALTY_PER_HOUR;

          await prisma.applications.update({
            where: { id: app.id },
            data: {
              cibi_sla_exceeded: true,
              cibi_penalty_amount: penalty,
            },
          });

          console.log(
            `  ⚠️  SLA Exceeded: ${hoursExceeded} hours over → Penalty: ₱${penalty}`
          );
          updated++;
          penalties_applied += penalty;
        }
      }
    }

    console.log(`\n✅ SLA check complete:`);
    console.log(`   Applications updated: ${updated}`);
    console.log(`   Total penalties applied: ₱${penalties_applied}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ SLA check failed:', error);
    process.exit(1);
  }
}

checkSLA();
