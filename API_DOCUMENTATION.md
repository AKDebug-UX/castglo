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
