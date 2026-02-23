# Prime Motors System — README (Part 2)

## What this system does

Prime Motors is an internal operations system for managing motorcycle inventory and sales across multiple branches, with supporting modules for purchasing, supplier tracking, financing/loan payment monitoring, and LTO registration tracking.

At a high level, the system helps the team:
- Keep a branch-by-branch view of inventory (including per-unit tracking via engine/chassis and unit numbers)
- Record sales (cash/financing) and track delivery status
- Generate and monitor loan payment schedules and actual payments
- Create and manage Purchase Orders (including partial deliveries, payment status, and PDF generation)
- Maintain supplier records and view supplier payment monitoring
- Track LTO registrations tied to sales/vehicle units, with reporting and Excel export
- Provide a dashboard/reports layer for management visibility

## Core modules (today)

### Authentication + roles
- JWT-based login and protected routes.
- Roles include: `gm`, `ceo`, `nsm`, `purchasing`, `accounting`, `finance`, `audit`, `branch`.
- Branch users are typically scoped to their branch; leadership/department roles can access cross-branch views.

### Inventory (branch operations)
- Tracks inventory movements by branch and model/item (delivery receipts, costs, SRP, quantities, remarks).
- Tracks individual units as `vehicle_units` (engine/chassis + `unit_number`), allowing “unit-level” status like available/sold/reserved.
- Supports transferring units between branches and listing transferred units (with a `transferred_history` table for traceability).
- Supports inventory import via file upload for bulk intake.

### Sales
- Records sales with customer details and operational fields like DR/SI numbers.
- Supports cash and financing-style fields (loan amount, terms, downpayment %, monthly amortization, AR balance, etc.).
- Tracks delivery status + delivery date.
- Links sales to sold inventory/vehicle units.

### Loan payments (financing follow-up)
- Generates a payment schedule per sale.
- Records payments, updates payment entries, and provides “overdue” and “upcoming” views.
- Supports a monthly report output.

### Purchase Orders (purchasing)
- Creates POs by branch/supplier with line items (model, color, qty, unit price, rebates/discounts).
- Tracks payment status, due dates, and payment details.
- Supports partial deliveries and completion workflows.
- Generates a PO PDF.
- Provides “pending items” and “available models” helpers.

### Suppliers
- CRUD for supplier records.
- Supplier payment monitoring endpoint to support purchasing/accounting workflows.

### LTO registration tracking
- Maintains LTO registration records tied to a sale and/or a vehicle unit.
- Tracks plate/MV file/CR/OR numbers and fees, plus insurance fields.
- Provides reporting and an Excel export.

### Reports + dashboard
- Dashboard analytics endpoint supports management views.
- Sales export endpoint supports daily/weekly/monthly/yearly/custom exports.

## How the pieces fit together (typical workflows)

- Receive inventory → create inventory movement + vehicle units → inventory becomes “available” in the branch.
- Create a sale → assign sold unit(s) → update delivery status/date → (if financing) generate a loan schedule.
- Record loan payments over time → monitor overdue/upcoming → export monthly report.
- Create purchase orders → monitor payment status/due date → receive partial deliveries → complete PO → generate PDF for documentation.
- After sale delivery → track LTO registration and insurance paperwork → export Excel for filing/monitoring.

## Tech stack (current)

- Frontend: React + TypeScript (Vite)
- Backend: Node.js (Express) + TypeScript
- Database: PostgreSQL via Prisma
- Documents/exports:
  - PDF generation (PO and reporting)
  - Excel exports (e.g., LTO registrations, sales exports)

## Current constraints / known rough edges

These are not “bugs” so much as natural growth points seen in the codebase:
- Some compiled JS files exist alongside TS sources in `backend/src` (e.g., `*.js` next to `*.ts`), which can complicate debugging and route resolution.
- Some routes include debug/hotfix logic to guarantee specific endpoints are matched.
- Root `README.md` is currently sparse; project knowledge is distributed across deployment docs and code.

## Long-term improvements (roadmap)

Below are realistic improvements that will pay off over time. They’re grouped so you can pick what matters most (stability, speed, governance, or new features).

### 1) Engineering quality & maintainability
- Standardize build output: keep TS source in `backend/src` and compiled JS in `backend/dist` only; ensure `tsconfig` + `.gitignore` prevent committed build artifacts.
- Enforce consistent routing: remove “hotfix” route overrides once router ordering and build artifacts are fixed.
- Add request validation: use a single validation layer (e.g., Zod) on the backend for payloads/queries.
- Add automated tests:
  - Backend: route/controller unit tests + a small integration suite against a test DB
  - Frontend: basic UI smoke tests for critical flows (inventory, sales, PO, payments)
- Add CI (GitHub Actions): lint/typecheck/build on PRs, optionally run a minimal integration suite.

### 2) Security, access control, and auditability
- Move RBAC enforcement server-side consistently (not just UI gating): verify role + branch scoping on every sensitive endpoint.
- Add structured audit logs for sensitive actions (sales edits, unit transfers, PO payment changes, account changes).
- Tighten production CORS origins, add rate limiting, and standardize error responses.
- Strengthen secrets management for deployments (rotate JWT secret, ensure environment variables are set in hosting).

### 3) Data model & data quality
- Add stronger invariants:
  - Ensure vehicle unit uniqueness constraints match real-world expectations
  - Prevent negative inventory / enforce inventory movement consistency
- Improve “transfer” modeling: treat transfers as first-class inventory movements rather than special cases where possible.
- Add reference data normalization for:
  - payment methods, sales categories, sources of sales
  - delivery/payment status enums
- Implement database backups + restore verification as a scheduled routine.

### 4) Performance & reporting
- Add/verify indexes based on real query patterns (date range reporting, branch filtering, overdue payments).
- Consider pre-aggregations for dashboard metrics (materialized views or scheduled aggregates).
- Add caching for heavy reports (short-lived) if performance becomes an issue.

### 5) Operational tooling
- Add a “data import validation” pipeline:
  - Validate file columns and row-level constraints
  - Provide an import preview and an error report
- Add admin utilities:
  - “Reconcile inventory vs sales” checkers
  - “Find duplicate engine/chassis” tooling
- Improve observability:
  - structured logging
  - request IDs
  - error tracking (Sentry or similar)

### 6) Product improvements (optional, if desired)
- Better end-to-end traceability per unit: “unit timeline” view (received → transferred → sold → registered).
- Supplier KPI view: lead times, fill rates, partial delivery frequency.
- Collections workflow: reminders/escalations for overdue loan payments.

## Where to look next

- Quick deployment notes: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Deployment walkthrough: [DEPLOYMENT.md](DEPLOYMENT.md)
- Backend service: `backend/`
- Frontend app: `frontend/`
