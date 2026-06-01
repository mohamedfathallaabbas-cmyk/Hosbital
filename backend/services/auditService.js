/**
 * AUDIT LOGGING SERVICE
 * 
 * Persists every sensitive action to the AuditLog table.
 * Falls back to console.error if DB write fails so it never blocks the main flow.
 */

import { prisma } from '../index.js';

/**
 * Records an action in the audit log.
 *
 * @param {object} opts
 * @param {number|null}  opts.userId      - Who performed the action
 * @param {string}       opts.action      - e.g. 'LOGIN', 'DISPENSE_MEDICINE'
 * @param {string}       opts.entityType  - e.g. 'Prescription', 'Invoice'
 * @param {number|null}  opts.entityId    - Primary key of the affected record
 * @param {object|null}  opts.oldData     - Snapshot before change
 * @param {object|null}  opts.newData     - Snapshot after change
 * @param {string|null}  opts.ipAddress
 * @param {string|null}  opts.userAgent
 */
export async function log({
  userId    = null,
  action,
  entityType = null,
  entityId   = null,
  oldData    = null,
  newData    = null,
  ipAddress  = null,
  userAgent  = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldData:   oldData  ? JSON.stringify(oldData)  : null,
        newData:   newData  ? JSON.stringify(newData)  : null,
        ipAddress,
        userAgent,
      }
    });
  } catch (err) {
    // Audit log must never crash the main request
    console.error('[AuditService] Failed to write audit log:', err.message);
  }
}

/**
 * Convenience helper – extracts IP / UA from an Express request object.
 */
export function fromRequest(req) {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    userAgent: req.headers['user-agent'] || null,
    userId: req.user?.id || null,
  };
}
