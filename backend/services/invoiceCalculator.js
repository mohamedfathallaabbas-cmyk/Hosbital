/**
 * INVOICE CALCULATOR SERVICE
 * 
 * Single source of truth for all invoice arithmetic.
 * Call recalculateInvoice() after ANY change to invoice items.
 * 
 * TAX_RATE: 14% VAT (Egypt standard)
 */

import { prisma } from '../index.js';

export const TAX_RATE = 0.14;

/**
 * Recalculates and persists the correct totals for an invoice.
 * Runs inside a transaction if `tx` is provided, otherwise uses the global prisma client.
 *
 * @param {number} invoiceId
 * @param {object} [tx] - Optional Prisma transaction context
 * @returns {Promise<object>} Updated invoice record
 */
export async function recalculateInvoice(invoiceId, tx = null) {
  const client = tx || prisma;

  // 1. Sum all items
  const agg = await client.invoiceItem.aggregate({
    where: { invoiceId },
    _sum: { amount: true }
  });

  const invoice = await client.invoice.findUnique({
    where: { id: invoiceId },
    select: { discount: true, patientId: true, claims: true },
    include: { claims: true }
  });

  const subtotal   = agg._sum.amount ?? 0;
  const discount   = invoice?.discount ?? 0;
  const taxable    = Math.max(0, subtotal - discount);
  const tax        = parseFloat((taxable * TAX_RATE).toFixed(2));
  const totalAmount = parseFloat((taxable + tax).toFixed(2));

  let patientShare = totalAmount;
  let insuranceShare = 0;

  const hasClaim = invoice?.claims && invoice.claims.length > 0;

  if (hasClaim) {
    // Search for active policy for the patient
    const policy = await client.insurancePolicy.findFirst({
      where: {
        patientId: invoice.patientId,
        expiryDate: { gte: new Date() }
      },
      include: { class: true }
    });

    if (policy) {
      const items = await client.invoiceItem.findMany({ where: { invoiceId } });
      let totalPatientShare = 0;
      let totalInsuranceShare = 0;

      for (const item of items) {
        let itemCoverage = policy.coveragePct; // e.g. 80.0

        if (policy.class) {
          const desc = item.description || '';
          if (desc.includes('كشف') || desc.includes('عيادة') || desc.includes('استشارة') || desc.includes('كشفية')) {
            itemCoverage = policy.class.consultationCov;
          } else if (desc.includes('تحليل') || desc.includes('مختبر') || desc.includes('دم') || desc.includes('فحص')) {
            itemCoverage = policy.class.labCoverage;
          } else if (desc.includes('أشعة') || desc.includes('رنين') || desc.includes('سونار')) {
            itemCoverage = policy.class.radCoverage;
          } else if (desc.includes('دواء') || desc.includes('صيدلية') || desc.includes('علاج')) {
            itemCoverage = policy.class.pharmacyCoverage;
          } else {
            itemCoverage = policy.class.defaultCoverage;
          }
        }

        // Handle both fractional (e.g. 0.8) and percentage (e.g. 80.0) representations
        const coverageFraction = itemCoverage > 1 ? itemCoverage / 100 : itemCoverage;
        
        const itemTaxable = Math.max(0, item.amount - (discount / (items.length || 1)));
        const itemTax = itemTaxable * TAX_RATE;
        const itemTotal = itemTaxable + itemTax;

        const insShare = parseFloat((itemTotal * coverageFraction).toFixed(2));
        const patShare = parseFloat((itemTotal - insShare).toFixed(2));

        totalInsuranceShare += insShare;
        totalPatientShare += patShare;
      }

      insuranceShare = parseFloat(totalInsuranceShare.toFixed(2));
      patientShare = parseFloat(totalPatientShare.toFixed(2));

      // Update the associated claim with the new insurance share amount
      const claim = invoice.claims[0];
      await client.claim.update({
        where: { id: claim.id },
        data: { claimedAmount: insuranceShare }
      });
    }
  }

  // 2. Compute amount already paid (payments cover patientShare)
  const paymentAgg = await client.payment.aggregate({
    where: { invoiceId },
    _sum: { amountPaid: true }
  });
  const paidAmount      = paymentAgg._sum.amountPaid ?? 0;
  const remainingAmount = Math.max(0, patientShare - paidAmount);

  // 3. Determine status based on payments
  let status;
  if (paidAmount <= 0) status = 'UNPAID';
  else if (remainingAmount <= 0) status = 'PAID';
  else status = 'PARTIAL';

  // 4. Persist
  return await client.invoice.update({
    where: { id: invoiceId },
    data:  { subtotal, tax, totalAmount, patientShare, insuranceShare, status }
  });
}

/**
 * Adds an item to an invoice and immediately recalculates totals.
 *
 * @param {object} opts
 * @param {number} opts.invoiceId
 * @param {string} opts.description
 * @param {number} opts.amount
 * @param {object} [tx]
 */
export async function addInvoiceItem({ invoiceId, description, amount }, tx = null) {
  const client = tx || prisma;

  await client.invoiceItem.create({
    data: { invoiceId, description, amount: parseFloat(amount) }
  });

  return recalculateInvoice(invoiceId, client);
}
