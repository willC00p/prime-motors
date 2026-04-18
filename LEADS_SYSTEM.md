# Leads Workflow Monitoring System

## Overview

The Leads system provides comprehensive monitoring and management of the entire application workflow pipeline from initial application submission through sales encoding. This system tracks each application as it moves through 10 distinct workflow stages with automatic SLA monitoring for CI/BI investigations.

## Application Workflow Pipeline

```
APPLICATION 
    ↓
LEADS 
    ↓
SUBMIT_REQS (PARTIAL/COMPLETE)
    ↓
CI_BI 
    ↓ (24-HOUR SLA)
CI_BI_RESULT (IF EXCEEDS 24HRS → PENALTY FOR CI/BI)
    ↓
HEAD_OFFICE 
    ↓
BRANCH_APPROVAL 
    ↓
CLIENT_NOTIFICATION 
    ↓
UNIT_RELEASE 
    ↓
SALES_ENCODING
```

## Database Schema

### applications table (Extended)

**Workflow Status Fields:**
- `workflow_status` (STRING): Current stage in the pipeline
  - Values: `APPLICATION`, `LEADS`, `SUBMIT_REQS`, `CI_BI`, `CI_BI_RESULT`, `HEAD_OFFICE`, `BRANCH_APPROVAL`, `CLIENT_NOTIFICATION`, `UNIT_RELEASE`, `SALES_ENCODING`
  - Default: `APPLICATION`

**Workflow Tracking Timestamps:**
- `leads_entered_at`: When moved to LEADS stage
- `requirements_submitted_at`: When requirements submitted
- `requirements_status`: `PARTIAL` or `COMPLETE`
- `cibi_started_at`: When CI/BI investigation began
- `cibi_completed_at`: When CI/BI investigation completed
- `cibi_result`: Result of CI/BI (`PASSED`, `FAILED`, `PENDING`)
- `head_office_submitted_at`: When submitted to head office
- `branch_submitted_at`: When submitted to branch
- `branch_approved_at`: When branch approved
- `client_notified_at`: When client was notified
- `unit_released_at`: When unit was released
- `sales_encoded_at`: When sales was encoded

**SLA Monitoring:**
- `cibi_sla_exceeded` (BOOLEAN): Flag when CI/BI exceeds 24 hours
- `cibi_penalty_amount` (DECIMAL): Automatic penalty per hour exceeded

**Assignment:**
- `assigned_investigator_id` (INTEGER FK): Assigned CI/BI investigator
- `notes` (TEXT): Internal workflow notes

**Indexes:**
- `idx_applications_workflow_status`: For quick status filtering
- `idx_applications_sla_exceeded`: For SLA penalty queries

## API Endpoints

### 1. Get All Leads
**Endpoint:** `GET /api/leads`

**Query Parameters:**
- `page` (default: 1) - Pagination page number
- `limit` (default: 50) - Results per page (max: 100)
- `workflow_status` - Filter by status (optional)
- `search` - Search by name, email, or phone (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "applicant_name": "John Doe",
      "applicant_phone": "09123456789",
      "applicant_email": "john@example.com",
      "workflow_status": "CI_BI",
      "cibi_sla_exceeded": false,
      "branches": { "id": 1, "name": "Main Branch" },
      "investigator": { "id": 5, "name": "Maria Santos", "email": "maria@example.com" },
      "cibi_applications": [
        {
          "id": 10,
          "status": "Pending",
          "system_recommendation": "APPROVED"
        }
      ],
      "created_at": "2026-04-18T10:00:00Z",
      "updated_at": "2026-04-18T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "pages": 5
  }
}
```

### 2. Get Leads Summary
**Endpoint:** `GET /api/leads/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "APPLICATION": 45,
    "LEADS": 32,
    "SUBMIT_REQS": 28,
    "CI_BI": 15,
    "CI_BI_RESULT": 8,
    "HEAD_OFFICE": 12,
    "BRANCH_APPROVAL": 25,
    "CLIENT_NOTIFICATION": 18,
    "UNIT_RELEASE": 22,
    "SALES_ENCODING": 95,
    "SLA_EXCEEDED": 3
  }
}
```

### 3. Get Lead Details
**Endpoint:** `GET /api/leads/:id`

**Response:** Full lead details including complete workflow history and CI/BI data.

### 4. Update Lead Status
**Endpoint:** `PUT /api/leads/:id/status`

**Request Body:**
```json
{
  "workflow_status": "CI_BI",
  "notes": "Assigned to Maria for investigation",
  "requirements_status": "COMPLETE"
}
```

**Response:** Updated application record with new status and timestamps.

### 5. Assign Investigator
**Endpoint:** `PUT /api/leads/:id/assign-investigator`

**Request Body:**
```json
{
  "investigator_id": 5
}
```

### 6. Check CI/BI SLA
**Endpoint:** `POST /api/leads/check-sla`

**Description:** Checks all completed CI/BI investigations and calculates penalties for those exceeding 24 hours.

**Penalty Calculation:**
- Base SLA: 24 hours
- Penalty: ₱100 per hour exceeded
- Example: If investigation completed in 26 hours, penalty = ₱200

**Response:**
```json
{
  "success": true,
  "message": "SLA check completed. Updated 3 applications with penalties.",
  "data": {
    "updated": 3
  }
}
```

## Frontend Features

### Leads Page (`/leads`)

**Access Control:**
- Roles: `gm`, `ceo`, `nsm`, `branch`, `investigator`
- Permission: `sales`

**Features:**

1. **Status Summary Cards**
   - Shows count of applications in each workflow stage
   - SLA exceeded counter for penalty tracking

2. **Search & Filter**
   - Search by applicant name, email, or phone
   - Filter by workflow status
   - Real-time search

3. **Leads Table**
   - Applicant information
   - Current workflow status with color coding
   - Assigned investigator
   - SLA status with penalty amount
   - Expandable rows for details

4. **Workflow Timeline (Expandable)**
   - Visual representation of all 10 stages
   - Click to move application to different stage
   - Shows completed stages in green
   - Current stage highlighted

5. **CI/BI Details (When Applicable)**
   - Investigation status
   - System recommendation
   - Quick access to CI/BI findings

6. **Pagination**
   - 20 applications per page
   - Navigation buttons
   - Page indicator

7. **Auto-Refresh**
   - Updates every 30 seconds
   - Manual refresh button

**Color Coding:**
- Application → Gray
- Leads → Blue
- Submit Requirements → Purple
- CI/BI → Orange
- CI/BI Result → Red
- Head Office → Green
- Branch Approval → Indigo
- Client Notification → Pink
- Unit Release → Teal
- Sales Encoding → Cyan

## Database Migration

### Applying the Migration

**Option 1: Using the Provided Script**
```bash
npm run db:apply:workflow
```

**Option 2: Direct SQL Execution**
Run the SQL statements in `backend/prisma/migrations/20250418_add_workflow_tracking/migration.sql` directly:

```sql
ALTER TABLE "applications" ADD COLUMN "workflow_status" VARCHAR(50) NOT NULL DEFAULT 'APPLICATION';
ALTER TABLE "applications" ADD COLUMN "leads_entered_at" TIMESTAMPTZ(6);
-- ... [other columns]
CREATE INDEX "idx_applications_workflow_status" ON "applications"("workflow_status");
```

### After Migration

1. All existing applications will default to `workflow_status = 'APPLICATION'`
2. Manual status updates required to move applications through pipeline
3. Auto-refresh of leads page shows real-time updates

## Workflow Logic

### Status Transitions

1. **APPLICATION → LEADS**
   - Initial state when application created
   - Recorded when moved to LEADS

2. **LEADS → SUBMIT_REQS**
   - Requirements stage
   - Can be marked as PARTIAL or COMPLETE
   - Investigator not yet assigned

3. **SUBMIT_REQS → CI_BI**
   - CI/BI investigation begins
   - Investigator assigned
   - SLA 24-hour timer starts

4. **CI_BI → CI_BI_RESULT**
   - Investigation completed
   - System auto-calculates SLA exceeded (if applicable)
   - Penalty amount recorded

5. **CI_BI_RESULT → HEAD_OFFICE**
   - Sent to head office for review
   - CI/BI recommendation checked

6. **HEAD_OFFICE → BRANCH_APPROVAL**
   - Branch manager reviews
   - Decision made

7. **BRANCH_APPROVAL → CLIENT_NOTIFICATION**
   - Result communicated to client
   - Timestamp recorded

8. **CLIENT_NOTIFICATION → UNIT_RELEASE**
   - Unit released to client
   - Delivery/pickup scheduled

9. **UNIT_RELEASE → SALES_ENCODING**
   - Sales transaction encoded
   - Final stage

## SLA Management

### 24-Hour CI/BI SLA

**Monitoring:**
- Starts when application moves to `CI_BI` stage
- Measured until `CI_BI_RESULT` completion
- Automatic check via `POST /api/leads/check-sla` endpoint

**Penalties:**
- ₱100 per hour exceeded 24-hour limit
- Example: 26-hour investigation = ₱200 penalty
- Recorded in `cibi_penalty_amount`
- Flag set: `cibi_sla_exceeded = true`

**Implementation:**
```bash
# Run SLA check every hour
0 * * * * npm run check:sla  # Cron job suggestion
```

## Integration Points

### With CI/BI System
- Applications linked via `application_id` foreign key
- CI/BI status influences workflow progression
- System recommendations feed into HEAD_OFFICE stage

### With Sales Module
- UNIT_RELEASE stage connects to vehicle release
- SALES_ENCODING stage integrates with sales transactions

### With Inventory
- Unit availability checked during UNIT_RELEASE
- Inventory movements recorded

## Reports & Analytics

**Key Metrics:**
- Applications per stage (summary endpoint)
- SLA compliance rate
- Average time per stage
- Investigator efficiency

**Future Enhancements:**
- Dashboard widget with workflow breakdown
- Email alerts for SLA risks
- Batch status updates
- Workflow history audit trail

## Notes

- All timestamps use `TIMESTAMPTZ(6)` for timezone support
- Workflow status is immutable audit trail
- Branch filtering applies to non-admin users
- Investigator assignment is optional until CI_BI stage
- System designed for 10,000+ concurrent leads
