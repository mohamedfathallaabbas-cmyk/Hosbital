/**
 * CENTRALIZED PERMISSION-BASED ACCESS CONTROL (RBAC)
 * 
 * This is the single source of truth for all role → permission mappings.
 * Instead of scattered `if(role === 'ADMIN')` checks, every authorization
 * decision flows through this config.
 */

// ── Granular Permissions ────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Auth
  MANAGE_USERS:           'MANAGE_USERS',

  // Appointments
  CREATE_APPOINTMENT:     'CREATE_APPOINTMENT',
  VIEW_ALL_APPOINTMENTS:  'VIEW_ALL_APPOINTMENTS',
  MANAGE_APPOINTMENT:     'MANAGE_APPOINTMENT',

  // Medical Records
  VIEW_MEDICAL_RECORDS:   'VIEW_MEDICAL_RECORDS',
  CREATE_MEDICAL_RECORD:  'CREATE_MEDICAL_RECORD',
  EDIT_MEDICAL_RECORD:    'EDIT_MEDICAL_RECORD',

  // Pharmacy
  DISPENSE_MEDICINE:      'DISPENSE_MEDICINE',
  MANAGE_INVENTORY:       'MANAGE_INVENTORY',
  VIEW_PRESCRIPTIONS:     'VIEW_PRESCRIPTIONS',

  // Finance
  VIEW_INVOICES:          'VIEW_INVOICES',
  CREATE_INVOICE:         'CREATE_INVOICE',
  MANAGE_INVOICE:         'MANAGE_INVOICE',
  VIEW_FINANCIAL_SUMMARY: 'VIEW_FINANCIAL_SUMMARY',

  // Patients
  VIEW_ALL_PATIENTS:      'VIEW_ALL_PATIENTS',
  MANAGE_PATIENT:         'MANAGE_PATIENT',

  // Files
  UPLOAD_FILES:           'UPLOAD_FILES',
  VIEW_ANY_FILE:          'VIEW_ANY_FILE',
  DELETE_ANY_FILE:        'DELETE_ANY_FILE',

  // Labs & Radiology
  MANAGE_LABS:            'MANAGE_LABS',
  VIEW_RADIOLOGY:         'VIEW_RADIOLOGY',

  // Staff / HR
  VIEW_ALL_STAFF:         'VIEW_ALL_STAFF',
  MANAGE_STAFF:           'MANAGE_STAFF',
  MANAGE_SALARY:          'MANAGE_SALARY',
  MANAGE_LEAVES:          'MANAGE_LEAVES',

  // Admin
  VIEW_ADMIN_STATS:       'VIEW_ADMIN_STATS',
  VIEW_AUDIT_LOG:         'VIEW_AUDIT_LOG',
};

// ── Role → Permission Map ────────────────────────────────────────────────────
const P = PERMISSIONS;

export const ROLE_PERMISSIONS = {
  ADMIN: Object.values(P), // Admin has everything

  MANAGER: [
    P.VIEW_ADMIN_STATS,
    P.VIEW_ALL_PATIENTS, P.VIEW_ALL_APPOINTMENTS,
    P.VIEW_MEDICAL_RECORDS,
    P.VIEW_INVOICES, P.CREATE_INVOICE, P.MANAGE_INVOICE, P.VIEW_FINANCIAL_SUMMARY,
    P.VIEW_ALL_STAFF, P.MANAGE_STAFF, P.MANAGE_SALARY, P.MANAGE_LEAVES,
    P.VIEW_PRESCRIPTIONS,
    P.MANAGE_INVENTORY,
    P.VIEW_RADIOLOGY,
    P.VIEW_AUDIT_LOG,
  ],

  FINANCIAL_MANAGER: [
    P.VIEW_INVOICES, P.CREATE_INVOICE, P.MANAGE_INVOICE, P.VIEW_FINANCIAL_SUMMARY,
    P.VIEW_ALL_PATIENTS,
    P.MANAGE_SALARY,
    P.VIEW_ALL_STAFF,
    P.VIEW_AUDIT_LOG,
  ],

  OPERATIONS_MANAGER: [
    P.VIEW_ALL_STAFF, P.MANAGE_STAFF,
    P.VIEW_ALL_PATIENTS,
    P.VIEW_ALL_APPOINTMENTS, P.MANAGE_APPOINTMENT,
    P.MANAGE_LEAVES,
    P.VIEW_AUDIT_LOG,
  ],

  DOCTOR: [
    P.VIEW_ALL_PATIENTS, P.VIEW_ALL_APPOINTMENTS, P.MANAGE_APPOINTMENT,
    P.VIEW_MEDICAL_RECORDS, P.CREATE_MEDICAL_RECORD, P.EDIT_MEDICAL_RECORD,
    P.VIEW_PRESCRIPTIONS,
    P.VIEW_RADIOLOGY, P.MANAGE_LABS,
    P.VIEW_INVOICES,
    P.VIEW_ANY_FILE,
  ],

  NURSE: [
    P.VIEW_ALL_PATIENTS, P.VIEW_ALL_APPOINTMENTS,
    P.VIEW_MEDICAL_RECORDS,
    P.VIEW_ANY_FILE,
  ],

  PHARMACIST: [
    P.VIEW_PRESCRIPTIONS,
    P.DISPENSE_MEDICINE,
    P.MANAGE_INVENTORY,
    P.VIEW_ALL_PATIENTS,
  ],

  LAB_TECH: [
    P.MANAGE_LABS,
    P.VIEW_RADIOLOGY,
    P.VIEW_ALL_PATIENTS,
  ],

  RECEPTION: [
    P.VIEW_ALL_PATIENTS, P.MANAGE_PATIENT,
    P.CREATE_APPOINTMENT, P.VIEW_ALL_APPOINTMENTS, P.MANAGE_APPOINTMENT,
    P.VIEW_INVOICES, P.CREATE_INVOICE, P.MANAGE_INVOICE,
  ],

  STAFF: [
    // Basic self-service only — permissions enforced at route level
  ],

  PATIENT: [
    P.CREATE_APPOINTMENT,
    P.VIEW_MEDICAL_RECORDS,
    P.UPLOAD_FILES,
    P.VIEW_RADIOLOGY,
  ],
};

/**
 * Returns true if the given role has the specified permission.
 * @param {string} role
 * @param {string} permission
 */
export function hasPermission(role, permission) {
  const roleUpper = (role || '').toUpperCase();
  const perms = ROLE_PERMISSIONS[roleUpper] || [];
  return perms.includes(permission);
}
