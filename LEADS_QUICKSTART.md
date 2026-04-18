# Leads System - Quick Start Guide

## For Administrators

### 1. Deploy the Leads System

**Step 1: Apply Database Migration**
```bash
cd backend
npm run db:apply:workflow
```

This adds workflow tracking columns to the `applications` table.

**Step 2: Restart Backend**
The changes are automatically picked up on server restart via Railway.

### 2. Test the Leads Page

**Access:** Navigate to `/leads` in the frontend
- Only visible to: `gm`, `ceo`, `nsm`, `branch`, `investigator` roles
- Shows all applications in the organization's branches

### 3. Monitor CI/BI SLA

**Manual Check:**
```bash
npm run check:sla
```

**Automated (Recommended):**
Set up a cron job to run hourly:
```bash
0 * * * * cd /path/to/backend && npm run check:sla
```

## For Branch Managers

### Moving Applications Through Workflow

1. **Open Leads Monitor** → Click `/leads`
2. **Search for Application** → Use search or filter by status
3. **Click Row to Expand** → Shows workflow timeline
4. **Click Stage Button** → Moves application to that stage
5. **Add Notes** → Optional notes for tracking

### Assigning Investigators

1. When application reaches `SUBMIT_REQS` stage
2. Click expand button on the row
3. Assign investigator via dropdown (future feature)
4. Investigator receives notification (future feature)

### Monitoring SLA

- Red banner appears if CI/BI exceeds 24 hours
- Shows penalty amount: `₱100 × (hours exceeded)`
- Check status summary to see SLA_EXCEEDED count

## For Investigators

### Workflow from Investigator Perspective

1. **Applications assigned to me** → Show in Leads page with my name
2. **Open CI/BI Applications** → `/cibi-applications`
3. **Complete Investigation** → Submit findings and recommendation
4. **Move to Result** → Application auto-moves to `CI_BI_RESULT`
5. **SLA Timer Stops** → Penalty calculated if applicable

## Key Dates/Timestamps Recorded

| Stage | Timestamp Field | What It Means |
|-------|-----------------|---------------|
| APPLICATION | (created_at) | Application created |
| LEADS | leads_entered_at | Moved to leads pool |
| SUBMIT_REQS | requirements_submitted_at | Requirements collected |
| CI_BI | cibi_started_at | Investigation started (SLA ⏱ starts) |
| CI_BI_RESULT | cibi_completed_at | Investigation complete (SLA ⏱ stops) |
| HEAD_OFFICE | head_office_submitted_at | Sent to head office |
| BRANCH_APPROVAL | branch_approved_at | Branch approved |
| CLIENT_NOTIFICATION | client_notified_at | Client notified |
| UNIT_RELEASE | unit_released_at | Unit released |
| SALES_ENCODING | sales_encoded_at | Sales encoded |

## API Reference for Integrations

### Quick API Examples

**Get all leads for branch:**
```bash
curl -H "Authorization: Bearer {token}" \
  "http://api.example.com/api/leads?page=1&limit=50&workflow_status=CI_BI"
```

**Move application to next stage:**
```bash
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"workflow_status": "CI_BI_RESULT"}' \
  "http://api.example.com/api/leads/123/status"
```

**Get summary counts:**
```bash
curl -H "Authorization: Bearer {token}" \
  "http://api.example.com/api/leads/summary"
```

## Troubleshooting

### Application Not Showing in Leads

**Check:**
1. Is the application `workflow_status` set? (Should default to `APPLICATION`)
2. Are you in the correct branch filter?
3. Are you logged in with the right role?

### SLA Not Calculating

**Check:**
1. Run `npm run check:sla` manually
2. Check if `cibi_started_at` and `cibi_completed_at` are set
3. Verify 24-hour threshold exceeded (show in logs)

### Can't See Leads Menu

**Check:**
1. Your role must be: `gm`, `ceo`, `nsm`, `branch`, or `investigator`
2. Contact admin to update your role if needed

## Next Steps

1. ✅ Deploy migration and test
2. ✅ Access `/leads` page
3. ✅ Move test applications through stages
4. ✅ Set up SLA cron job
5. ✅ Train staff on workflow
6. Plan for future enhancements:
   - Email notifications at each stage
   - SMS alerts for SLA risks
   - Bulk status updates
   - Custom workflow templates
   - Performance analytics
