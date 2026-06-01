import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runGlobalAudit() {
  console.log('--- STARTING GLOBAL HOSPITAL SYSTEM AUDIT ---');

  const findings = [];

  // 1. Check Appointment Concurrency Protection
  // We'll simulate checking the route logic (since we can't easily run a full express server + concurrent requests in one go without more setup, 
  // we'll analyze the logic and verify with a DB check if duplicates exist).
  console.log('[1] Checking for Duplicate Appointments...');
  const duplicates = await prisma.$queryRaw`
    SELECT "doctorId", "date", "timeSlot", COUNT(*) 
    FROM "Appointment" 
    WHERE "status" NOT IN ('CANCELLED', 'REJECTED')
    GROUP BY "doctorId", "date", "timeSlot"
    HAVING COUNT(*) > 1
  `;
  if (duplicates.length > 0) {
    findings.push({
      issue: 'Double Booking Detected',
      details: `Found ${duplicates.length} instances where the same doctor has multiple appointments in the same slot.`,
      severity: 'HIGH'
    });
  } else {
    console.log('✓ No double bookings found in current data.');
  }

  // 2. Check Inventory Consistency
  console.log('[2] Checking Inventory Levels...');
  const negativeStock = await prisma.medicine.findMany({
    where: { stock: { lt: 0 } }
  });
  if (negativeStock.length > 0) {
    findings.push({
      issue: 'Negative Stock Detected',
      details: `Medicines ${negativeStock.map(m => m.name).join(', ')} have negative stock.`,
      severity: 'CRITICAL'
    });
  } else {
    console.log('✓ No negative stock detected.');
  }

  // 3. Check Financial Inconsistency (Invoice Totals)
  console.log('[3] Checking Invoice Totals Consistency...');
  const inconsistentInvoices = await prisma.invoice.findMany({
    include: { items: true }
  });
  
  let inconsistencyCount = 0;
  inconsistentInvoices.forEach(inv => {
    const calculatedSubtotal = inv.items.reduce((sum, item) => sum + item.amount, 0);
    // Note: pharmacy.js increments totalAmount but DOES NOT update subtotal.
    // If subtotal is 0 but totalAmount is > 0, it's inconsistent.
    if (Math.abs(inv.totalAmount - (inv.subtotal + inv.tax - inv.discount)) > 0.01) {
      inconsistencyCount++;
    }
  });

  if (inconsistencyCount > 0) {
    findings.push({
      issue: 'Financial Inconsistency',
      details: `${inconsistencyCount} invoices have totalAmount that does not match subtotal/tax/discount logic. (Likely caused by pharmacy dispense increments).`,
      severity: 'MEDIUM'
    });
  } else {
    console.log('✓ Invoice totals are consistent.');
  }

  // 4. Check for Orphans (Data Integrity)
  console.log('[4] Checking for Orphaned Records...');
  // Check if there are MedicalRecords without Appointments (shouldn't happen with Prisma but good to check)
  const orphanRecords = await prisma.$queryRaw`
    SELECT id FROM "MedicalRecord" WHERE "appointmentId" NOT IN (SELECT id FROM "Appointment")
  `;
  if (orphanRecords.length > 0) {
    findings.push({
      issue: 'Orphaned Medical Records',
      details: `Found ${orphanRecords.length} records without matching appointments.`,
      severity: 'MEDIUM'
    });
  }

  // 5. Check for IDOR vulnerabilities in logic (Static Analysis simulation)
  console.log('[5] Verifying IDOR Protections...');
  // Based on my view_file of pharmacy.js, dispensing DOES NOT check if the pharmacy user is a PHARMACIST role.
  // It only uses 'authenticate'.
  findings.push({
    issue: 'Missing Role Check in Pharmacy Dispense',
    details: 'The route PATCH /api/pharmacy/prescriptions/:id/dispense uses "authenticate" but missing "requireRole(\'PHARMACIST\', \'ADMIN\')". Any logged-in user (even a patient) could potentially dispense a prescription if they know the ID.',
    severity: 'HIGH'
  });

  // 6. Check for Base64 issues
  console.log('[6] Checking for Large Base64 Files...');
  const largeFiles = await prisma.patientFile.findMany({
    where: { fileUrl: { startsWith: 'data:' } }
  });
  if (largeFiles.length > 0) {
    findings.push({
      issue: 'Scalability Risk: Base64 Storage',
      details: `Found ${largeFiles.length} files stored as base64 in the database. This will lead to performance degradation and payload size errors.`,
      severity: 'MEDIUM'
    });
  }

  console.log('--- AUDIT COMPLETE ---');
  console.log('Total Issues Found:', findings.length);
  console.log(JSON.stringify(findings, null, 2));

  await prisma.$disconnect();
}

runGlobalAudit().catch(e => {
  console.error(e);
  process.exit(1);
});
