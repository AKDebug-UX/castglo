# CastGlo Extended API Documentation

This document lists the API endpoints implemented in the **CastGlo** frontend that are **not** available or fully detailed in the standard documentation at `https://castglo-qupm.onrender.com/api-docs/#/`.

---

## **1. Admin Management Endpoints**
These endpoints are used within the Admin Dashboard for platform-wide control.

### **A. Moderation**
- **Moderation Queue**: `GET /admin/moderation`
  - *Description*: Fetches content flagged by AI or users for review.
- **Update Moderation Status**: `PATCH /admin/moderation/:id`
  - *Description*: Approves, rejects, or escalates flagged content.

### **B. Verifications (Talent/Director)**
- **Get All Verifications**: `GET /admin/verifications`
  - *Description*: Lists all pending and processed document verification requests.
- **Update Verification Status**: `PATCH /admin/verifications/:id/status`
  - *Description*: Approves or rejects a user's identity/professional verification.
- **Verification Stats**: `GET /admin/verifications/stats`
  - *Description*: Summary counts of pending, approved, and rejected requests.

### **C. Submissions (Auditions)**
- **Get All Submissions**: `GET /admin/submissions`
  - *Description*: Global view of all talent audition submissions.
- **Update Submission Status**: `PATCH /admin/submissions/:id/status`
  - *Description*: Administrative override for audition status (Flagged, Approved, etc.).
- **Submission Stats**: `GET /admin/submissions/stats`
  - *Description*: Analytics on submission volume and quality scores.

### **D. Bookings (Professional Services)**
- **Admin Bookings View**: `GET /admin/bookings`
  - *Description*: Monitor all service transactions between Professionals and Talent.
- **Admin Booking Stats**: `GET /admin/bookings/stats`
  - *Description*: Revenue and volume metrics for the service marketplace.

---

## **2. Platform Settings & Trial Management**
- **Get Platform Settings**: `GET /admin/settings`
  - *Description*: Retrieves current platform configuration, including free tier durations.
- **Set Free Tier Trial**: `POST /admin/settings/free-tier`
  - *Payload*: `{ days: number, role: string }`
  - *Description*: Configures the number of trial days for new users based on their selected role.



**Note**: All endpoints listed above require a valid `Authorization: Bearer <token>` header with appropriate role permissions (Admin or Professional).
