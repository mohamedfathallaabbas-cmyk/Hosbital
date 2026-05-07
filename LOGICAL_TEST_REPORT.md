# Logical Test Report and Future Error Risk Assessment

Date: 2026-05-07

## Scope

This report covers the recent changes around:

- Staff role login and staff self-service dashboard.
- Staff payroll, leave summary, and attendance APIs.
- Patient profile backend binding.
- Patient blood donation backend binding.
- Patient medical/radiology upload backend binding.
- Doctor prescription backend binding.
- Reception rejection reason flow.
- Admin employee management.

## Logical Tests Performed

### 1. Backend Syntax Validation

Commands:

```powershell
node --check backend\routes\auth.js
node --check backend\routes\staff.js
node --check backend\routes\medicalRecords.js
node --check backend\routes\patients.js
```

Result: Passed. No JavaScript syntax errors were found in these backend route files.

### 2. Frontend Production Build

Command:

```powershell
npm.cmd run build
```

Result: Passed after running outside the sandbox because esbuild was blocked by `spawn EPERM` in the restricted environment.

Non-blocking warnings:

- CSS warning: `@import` should appear before Tailwind statements in `src/index.css`.
- Bundle warning: generated JS chunk is larger than 500 KB.

### 3. Staff Login Data Test

Checked the database for:

- `staff@alshifa.com` exists.
- Role is `STAFF`.
- User has a linked `staffProfile`.
- Password `123456` matches the stored hash.

Result:

```json
{
  "exists": true,
  "role": "STAFF",
  "hasStaffProfile": true,
  "passwordOk": true
}
```

## Current Working Login

Staff account:

```text
Email: staff@alshifa.com
Password: 123456
```

## Logical Flow Review

### Staff Role

Expected flow:

1. User selects Staff role.
2. Login redirects to `/staff/dashboard`.
3. Staff dashboard calls `/api/staff/me`.
4. Employee can see profile data, payroll summary, deductions, leave balance, and attendance.
5. Employee can call `/api/staff/me/attendance` for check-in/check-out.

Status: Logically valid.

### Admin Employee Management

Expected flow:

1. Admin opens `/admin/employees`.
2. Admin can create employee users.
3. Financial manager/admin can update salary and allowances.
4. Operations manager can view staff data through `/api/staff`.

Status: Logically valid, with caveats listed below.

### Patient Profile

Expected flow:

1. Patient opens profile page.
2. Frontend loads `/api/patients/:id`.
3. Patient edits phone, blood type, weight, height, allergies, chronic diseases, and emergency contact.
4. Frontend saves through `PATCH /api/patients/:id`.

Status: Logically valid.

### Patient Blood Donation

Expected flow:

1. Patient opens blood donation page.
2. Frontend loads patient profile to get `nationalId` and `bloodType`.
3. Frontend loads donation history from `/api/medical-records/blood-donations`.
4. New donation is saved through `POST /api/medical-records/blood-donations`.

Status: Logically valid.

Important condition: patient must have a `nationalId`; otherwise donation save is blocked.

### Patient Uploads

Expected flow:

1. Patient selects image/PDF.
2. Frontend converts file to `data:` URL.
3. Frontend saves it through `POST /api/medical-records/radiology`.
4. Frontend lists saved files from `GET /api/medical-records/radiology`.

Status: Works logically for small files.

Important risk: storing base64 file data in the database/API payload is not suitable for large files.

## Possible Future Errors and Risks

### High Priority

1. Large file upload failures

Current uploads are stored as base64 `data:` URLs in `RadiologyRecord.fileUrl`. Large PDFs or images can exceed Express JSON body limits and cause `PayloadTooLargeError`.

Recommended fix:

- Use `multer` or cloud/local file storage.
- Store only a file path or URL in the database.
- Increase body limit only as a temporary workaround.

2. Patient can access/update other patient IDs if URL is manipulated

Some routes accept `:id` or `patientId` and do not fully enforce ownership for role `PATIENT`.

Recommended fix:

- In patient routes, if `req.user.role === 'PATIENT'`, force `patientId = req.user.patientId`.
- Reject access when requested ID does not match the token.

3. Payroll is only calculated, not truly paid

`payroll.isPaid` is currently static false and not backed by a payroll/payment table.

Recommended fix:

- Add a `Payroll` model with month, base salary, allowances, deductions, net salary, status, and paid date.
- Let financial manager mark payroll as paid.

4. Leave balance is calculated from attendance status only

Leave balance uses attendance rows with status `LEAVE`; there is no leave request/approval workflow.

Recommended fix:

- Add `LeaveRequest` model.
- Add statuses: `PENDING`, `APPROVED`, `REJECTED`.
- Deduct leave only after approval.

### Medium Priority

5. Attendance unique date can be timezone-sensitive

The attendance unique key uses `userId + date`. The app sets local midnight in JavaScript, which can shift depending on server timezone.

Recommended fix:

- Store date as normalized UTC date string or use a dedicated date-only field approach.
- Centralize date normalization in one helper.

6. Doctor prescription can create appointment records automatically

When a doctor creates a prescription without an appointment, the backend creates a completed `PRESCRIPTION` appointment. This is useful, but it can affect appointment statistics.

Recommended fix:

- Add explicit prescription-only model relation or exclude `type = PRESCRIPTION` from appointment dashboards.

7. Medicine not in inventory is supported but dispensing may confuse users

Prescription items without `medicineId` do not decrement stock and have no price. Pharmacy may dispense a prescription with mixed inventory/non-inventory items.

Recommended fix:

- Show “outside pharmacy” label clearly.
- Add pharmacy action: substitute/link external medicine to inventory.

8. Operations manager role still exists in backend and seed

The UI role option was removed, but `OPERATIONS_MANAGER` remains in backend permissions and seed data. This is fine if the role is still used internally, but confusing if truly deleted.

Recommended fix:

- Decide whether `OPERATIONS_MANAGER` is still a backend role.
- If removed fully, update seed, permissions, and existing users.

### Low Priority

9. CSS import order warning

`@import` in `src/index.css` appears after Tailwind directives.

Recommended fix:

- Move Google Fonts `@import` to the top of the file before `@tailwind`.

10. Large frontend bundle

The app bundle exceeds 500 KB after minification.

Recommended fix:

- Lazy-load dashboards with `React.lazy`.
- Split large pages by route.

11. Arabic text encoding is inconsistent in several old files

Some source files show mojibake-style text. The app may still render if original encoding is preserved, but future edits can worsen it.

Recommended fix:

- Normalize files to UTF-8.
- Gradually clean visible Arabic strings in touched files.

12. Seed data may overwrite manual test users

`seed_master.js` deletes all users and recreates data. Running it will remove manually inserted or edited accounts unless they are included in the seed.

Recommended fix:

- Add `staff@alshifa.com` to `seed_master.js`.
- Avoid destructive seed in development unless expected.

## Recommended Next Steps

1. Add `staff@alshifa.com` permanently to `seed_master.js`.
2. Add authorization guards so patients cannot read/update other patients.
3. Replace base64 uploads with real file storage.
4. Add real payroll and leave models.
5. Fix CSS `@import` order.
6. Add API integration tests for auth, staff dashboard, patient profile, donation, and uploads.

## Final Status

The current implementation passes syntax checks and frontend production build. The staff account exists and the password is valid. The main remaining risks are not syntax issues; they are data ownership, file upload scalability, payroll modeling, and seed consistency.
