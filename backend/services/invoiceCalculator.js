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
    select: { discount: true }
  });

  const subtotal   = agg._sum.amount ?? 0;
  const discount   = invoice?.discount ?? 0;
  const taxable    = Math.max(0, subtotal - discount);
  const tax        = parseFloat((taxable * TAX_RATE).toFixed(2));
  const totalAmount = parseFloat((taxable + tax).toFixed(2));

  // 2. Compute amount already paid
  const paymentAgg = await client.payment.aggregate({
    where: { invoiceId },
    _sum: { amountPaid: true }
  });
  const paidAmount      = paymentAgg._sum.amountPaid ?? 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  // 3. Determine status based on payments
  let status;
  if (paidAmount <= 0) status = 'UNPAID';
  else if (remainingAmount <= 0) status = 'PAID';
  else status = 'PARTIAL';

  // 4. Persist
  return await client.invoice.update({
    where: { id: invoiceId },
    data:  { subtotal, tax, totalAmount, status }
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
