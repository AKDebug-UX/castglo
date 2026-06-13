# CastGlo Profile API Documentation

This document outlines the API endpoints and data structures required for the CastGlo user profile and account settings.

## 1. Authentication & User Profile (`/auth/me` and `/profile/me`)

Used to fetch the current user's profile and authentication data.

### `GET /auth/me`
**Description:** Fetches basic user account details.
**Response Body:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "location": "string",
    "isVerified": "boolean",
    "roles": ["talent", "casting_director", "admin"],
    "notificationSettings": {
      "jobSearchEmail": "boolean",
      "jobRecFrequency": "daily | monthly | none",
      "jobPostingAlerts": "boolean",
      "applicationAlerts": "boolean",
      "savedJobsRoundup": "boolean"
    }
  }
}
```

### `GET /profile/me`
**Description:** Fetches professional/talent profile details.
**Response Body:**
```json
{
  "success": true,
  "data": {
    "bio": "string",
    "stageName": "string",
    "organisationType": "creative-agency | casting | production | theatre | brand | others",
    "jobTitle": "actor | director | producer | casting-director | agent | crew | other",
    "website": "string (url)",
    "professionalLinks": ["string (url)"],
    "professionalRoles": ["string"],
    "highlights": "string",
    "gender": "male | female | non-binary | other",
    "ageRange": "18-25 | 25-35 | 35-45 | 45+",
    "physicalAttributes": {
      "height": "number",
      "weight": "number",
      "eyeColor": "string"
    },
    "skills": ["string"],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "year": "string"
      }
    ],
    "equipment": ["string"],
    "talent": {
      "headshots": [
        {
          "_id": "string",
          "url": "string (url)"
        }
      ]
    }
  }
}
```

## 2. Update Profile (`PATCH /user/profile` and `PATCH /profile/me`)

Used to update account and professional details.

### `PATCH /user/profile`
**Description:** Updates core user information.
**Request Body:**
```json
{
  "fullName": "string",
  "bio": "string",
  "location": "string",
  "phoneNumber": "string",
  "address": "string",
  "stageName": "string",
  "organisationType": "string",
  "jobTitle": "string",
  "website": "string",
  "professionalLinks": ["string"],
  "notificationSettings": {
    "jobSearchEmail": "boolean",
    "jobRecFrequency": "string",
    "jobPostingAlerts": "boolean",
    "applicationAlerts": "boolean",
    "savedJobsRoundup": "boolean"
  }
}
```

### `PATCH /profile/me`
**Description:** Updates professional profile attributes.
**Request Body:**
```json
{
  "bio": "string",
  "skills": ["string"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "equipment": ["string"],
  "physicalAttributes": {
    "height": "number",
    "weight": "number",
    "eyeColor": "string"
  },
  "experience": "string"
}
```

## 3. Media Management

### `POST /profile/headshot`
**Description:** Uploads a new profile picture or headshot.
**Request:** `FormData` containing a `headshot` file.
**Response:** `{ "success": true, "data": { "url": "string" } }`

### `DELETE /profile/headshot/:id`
**Description:** Deletes a specific headshot by ID.

## 4. Security

### `POST /auth/change-password`
**Description:** Updates the user's password.
**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### `DELETE /user/account`
**Description:** Permanently deletes the user's account.

## 5. Subscription & Payments

### `GET /subscription/status`
**Description:** Fetches current subscription information.
**Response Body:**
```json
{
  "success": true,
  "data": {
    "status": "active | inactive | trialing | past_due",
    "plan": {
      "name": "string",
      "price": "number"
    },
    "billingCycle": "monthly | annual",
    "currentPeriodEnd": "string (ISO date)"
  }
}
```

### `GET /user/payment-methods`
**Description:** Fetches saved payment methods (e.g., from Stripe).
**Response Body:**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "last4": "string",
        "expMonth": "number",
        "expYear": "number",
        "brand": "string"
      }
    ]
  }
}
```

## 6. Verification & Blockchain

### `POST /blockchain/verify`
**Description:** Anchors a document to the blockchain for verification.
**Request:** `FormData` containing:
- `document`: file
- `documentType`: "identity" | "professional" | "company"

### `GET /blockchain/history`
**Description:** Fetches the history of anchored documents.
**Response Body:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "string",
        "documentName": "string",
        "documentHash": "string",
        "createdAt": "string (ISO date)"
      }
    ]
  }
}
```

## 7. Admin

Used by administrators to manage platform data, users, and settings.

### `GET /admin/users`
**Description:** Get all users.

### `PUT /admin/users/{userId}/suspend`
**Description:** Suspend a user.

### `PUT /admin/users/{userId}/unsuspend`
**Description:** Unsuspend a user.

### `PUT /admin/users/{userId}/verify`
**Description:** Verify user profile.

### `DELETE /admin/users/{userId}`
**Description:** Delete a user.

### `GET /admin/action-logs`
**Description:** Get action logs.

### `GET /admin/analytics`
**Description:** Get platform analytics.

### `GET /admin/leads`
**Description:** Get leads overview.

### `GET /admin/subscriptions`
**Description:** Get subscription overview.

### `GET /admin/settings`
**Description:** Get global platform settings.

### `PATCH /admin/settings`
**Description:** Update global platform settings.

### `POST /admin/settings/free-tier`
**Description:** Configure the number of trial days for new users based on their selected role.

### `POST /admin/users/{userId}/grant-trial`
**Description:** Grant a free trial to a user.

### `GET /admin/casting-calls/pending`
**Description:** Get all pending casting calls awaiting approval.

### `PATCH /admin/casting-calls/{id}/approve`
**Description:** Approve a pending casting call.

### `PATCH /admin/casting-calls/{id}/reject`
**Description:** Reject a pending casting call.

### `GET /admin/moderation`
**Description:** Get moderation queue for flagged content.

### `PATCH /admin/moderation/{id}`
**Description:** Update status of a moderation item.

### `GET /admin/verifications`
**Description:** List all document verification requests.

### `PATCH /admin/verifications/{id}/status`
**Description:** Approve or reject a verification request.

### `GET /admin/verifications/stats`
**Description:** Summary of verification request counts.

### `GET /admin/submissions`
**Description:** Global view of all talent audition submissions.

### `PATCH /admin/submissions/{id}/status`
**Description:** Administrative override for audition status.

### `GET /admin/submissions/stats`
**Description:** Analytics on submission volume.

### `GET /admin/bookings`
**Description:** Monitor all service transactions.

### `GET /admin/bookings/stats`
**Description:** Revenue and volume metrics for bookings.

## 8. Applications

### `PUT /applications/{applicationId}/shortlist`
**Description:** Shortlist an applicant.

### `PUT /applications/{applicationId}/reject`
**Description:** Reject an applicant.

### `PUT /applications/{applicationId}/accept`
**Description:** Accept an applicant.

### `POST /applications/{applicationId}/communication`
**Description:** Send a message/communication to an applicant.

## 9. Casting Calls

### `PUT /casting-calls/{id}/close`
**Description:** Close a casting call.

### `POST /casting-calls/{id}/boost`
**Description:** Boost visibility of a casting call.

### `POST /casting-calls/{id}/instant-post`
**Description:** Instantly post a casting call.

## 10. Projects

### `POST /projects`
**Description:** Create a new project.

### `GET /projects/me`
**Description:** Get my projects.

### `GET /projects/{id}`
**Description:** Get a specific project.

### `PATCH /projects/{id}`
**Description:** Update a project.

### `DELETE /projects/{id}`
**Description:** Delete a project.

### `GET /projects/{id}/roles`
**Description:** Get roles for a project.

### `POST /projects/{id}/roles`
**Description:** Create a role for a project.

### `PATCH /projects/{id}/roles/{roleId}`
**Description:** Update a project role.

### `DELETE /projects/{id}/roles/{roleId}`
**Description:** Delete a project role.

### `GET /projects/{id}/roles/{roleId}/applicants`
**Description:** Get applicants for a role.

### `PATCH /projects/{id}/roles/{roleId}/applicants/{applicantId}/status`
**Description:** Update applicant status for a role.

### `POST /projects/{id}/roles/{roleId}/applicants/bulk-action`
**Description:** Perform bulk action on applicants.

### `GET /projects/{id}/roles/{roleId}/matches`
**Description:** Get AI matches for a project role.

## 11. Additional Profile & Portfolio Endpoints

### `GET /portfolio/me`
**Description:** Get my portfolio.

### `PATCH /portfolio/{id}`
**Description:** Update a portfolio item.

### `DELETE /portfolio/{id}`
**Description:** Delete a portfolio item.

### `PATCH /profiles/me/talent-type`
**Description:** Update talent type.

### `PATCH /profiles/me/professional`
**Description:** Update professional details.

### `GET /profiles/me/completeness`
**Description:** Get profile completeness score.

### `POST /profiles/me/headshots`
**Description:** Add headshots.

### `DELETE /profiles/me/headshots/{headshotId}`
**Description:** Delete a headshot.

### `PATCH /profiles/me/account`
**Description:** Update account profile details.

### `POST /profiles/me/cover-image`
**Description:** Upload a cover image.

### `POST /profiles/me/intro-video`
**Description:** Upload an intro video.

### `POST /profiles/me/cv`
**Description:** Upload a CV.

### `DELETE /profiles/me/cv`
**Description:** Delete a CV.

### `POST /profiles/me/portfolio`
**Description:** Add a portfolio item.

### `DELETE /profiles/me/portfolio/{itemId}`
**Description:** Delete a portfolio item.

### `POST /profiles/me/photos`
**Description:** Upload photos.

### `DELETE /profiles/me/photos/{photoId}`
**Description:** Delete a photo.

## 12. Additional Authentication

### `POST /auth/google`
**Description:** Authenticate using Google OAuth.

### `POST /auth/set-password`
**Description:** Set a password for an account.

## 13. Subscriptions (Extensions)

### `POST /subscriptions/webhook`
**Description:** Webhook for subscription events.

### `GET /subscriptions/details`
**Description:** Get detailed subscription information.

### `POST /subscriptions/upgrade`
**Description:** Upgrade a subscription.

### `POST /subscriptions/cancel`
**Description:** Cancel a subscription.

## 14. Livestreaming

### `POST /livestream/{id}/messages`
**Description:** Post a message to a livestream.

### `GET /livestream/{id}/messages`
**Description:** Get messages from a livestream.

### `POST /livestream/{id}/start`
**Description:** Start a livestream.

### `POST /livestream/{id}/join`
**Description:** Join a livestream.

### `POST /livestream/{id}/leave`
**Description:** Leave a livestream.

### `PATCH /livestream/{id}/end`
**Description:** End a livestream.

### `POST /livestream/{id}/invite`
**Description:** Invite to a livestream.

### `GET /livestream/{id}/participants`
**Description:** Get livestream participants.

### `POST /livestream/{id}/cohost`
**Description:** Make a participant a co-host.

### `DELETE /livestream/{id}/cohost/{userId}`
**Description:** Remove a co-host.

## 15. Messaging & Notifications

### `GET /messaging/conversations/{id}/messages`
**Description:** Get messages for a conversation.

### `POST /messaging/bulk-message`
**Description:** Send a bulk message.

### `POST /notifications/register-device`
**Description:** Register a device for push notifications.

### `POST /notifications/send`
**Description:** Send a notification.

### `PATCH /notifications/{id}/read`
**Description:** Mark a notification as read.

## 16. Miscellaneous Endpoints

### `PATCH /bookings/{id}/status`
**Description:** Update the status of a booking.

### `GET /leads/admin/leads`
**Description:** Admin get all leads.

### `GET /leads/admin/leads/{id}`
**Description:** Admin get a specific lead.

### `DELETE /leads/admin/leads/{id}`
**Description:** Admin delete a lead.

### `PUT /leads/admin/leads/{id}/convert`
**Description:** Convert a lead to a user/customer.

### `GET /reference`
**Description:** Get general reference data.

### `GET /reference/{type}`
**Description:** Get specific reference data by type.

### `POST /reports`
**Description:** Create a new report.

### `GET /blockchain/validate/{hash}`
**Description:** Validate a document hash via the blockchain.

