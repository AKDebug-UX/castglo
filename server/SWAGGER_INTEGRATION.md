# Swagger UI Integration Guide

## Overview
The Castglo API now includes comprehensive Swagger UI documentation with interactive API testing capabilities.

## Features
- **OpenAPI 3.0 Specification**: Complete API documentation using OpenAPI 3.0 standard
- **Interactive Testing**: Try API endpoints directly from the Swagger UI interface
- **JWT Authentication**: Built-in support for Bearer token authentication
- **Request/Response Examples**: All endpoints include example requests and responses
- **Organized by Tags**: Endpoints grouped into logical categories (Authentication, Users, Profiles, etc.)

## Accessing Swagger UI

### Local Development
Visit: `http://localhost:5000/api-docs`

### Production
Visit: `https://api.castglo.com/api-docs`

## Key Documentation Features

### Security Schemes
All protected endpoints use **BearerAuth** (JWT) security scheme:
- Include Bearer token in Authorization header
- Token format: `Authorization: Bearer <jwt-token>`

### Endpoint Categories
Documentation is organized into 8 main API modules:

1. **Authentication** (7 endpoints)
   - Register, Login, Verify Email
   - Password Reset, Change Password
   - Get Current User

2. **Leads** (5 endpoints)
   - Create Lead, Get All Leads
   - Convert Lead to User
   - Delete Lead (Admin)

3. **Users** (6 endpoints)
   - Get/Update Profile
   - Upload Profile Picture
   - Search Users, Get Public Profile
   - Delete Account

4. **Profiles** (8 endpoints)
   - Create/Update Profile
   - Add Headshots, Upload Showreel
   - Search Profiles, Get Public Profile
   - Delete Headshots

5. **Casting Calls** (7 endpoints)
   - Get All Casting Calls
   - Create/Update/Close Casting Calls
   - Get My Listings
   - Delete Casting Calls

6. **Applications** (9 endpoints)
   - Submit Application
   - Get My Applications
   - Shortlist/Reject/Accept Applications
   - Add Communication
   - Withdraw Application

7. **Subscriptions** (7 endpoints)
   - Create Checkout Session
   - Get Subscription Status/Details
   - Upgrade/Cancel Subscription
   - Stripe Webhook Handler
   - Get Available Plans

8. **Admin** (9 endpoints)
   - User Management (Suspend/Unsuspend/Delete)
   - Verify User Profile
   - View Action Logs
   - Platform Analytics
   - Leads Overview
   - Subscription Overview

## File Structure

```
server/
├── config/
│   └── swagger.js                 # OpenAPI 3.0 specification
├── routes/
│   ├── authRoutes.js             # Auth endpoints with Swagger docs
│   ├── leadRoutes.js             # Lead endpoints with Swagger docs
│   ├── userRoutes.js             # User endpoints with Swagger docs
│   ├── profileRoutes.js          # Profile endpoints with Swagger docs
│   ├── castingCallRoutes.js      # Casting Call endpoints with Swagger docs
│   ├── applicationRoutes.js      # Application endpoints with Swagger docs
│   ├── subscriptionRoutes.js     # Subscription endpoints with Swagger docs
│   └── adminRoutes.js            # Admin endpoints with Swagger docs
└── app.js                         # Updated with Swagger UI middleware
```

## Using Swagger UI

### 1. **Explore Endpoints**
- Navigate to any endpoint section
- Read detailed descriptions and parameter documentation
- View request/response schemas

### 2. **Test Endpoints**
- Click "Try it out" button on any endpoint
- Fill in required parameters and request body
- Click "Execute" to send the request
- View response status, headers, and body

### 3. **Authentication**
- Click the lock icon on protected endpoints
- Paste your JWT token when prompted
- All subsequent requests will include the token

### 4. **View Models**
- Scroll to "Schemas" section at bottom
- View all available data models and their properties
- Check field types, formats, and examples

## Technology Stack

- **swagger-jsdoc**: ^6.2.8 - Convert JSDoc comments to OpenAPI spec
- **swagger-ui-express**: ^5.0.0 - Express middleware for Swagger UI
- **OpenAPI Version**: 3.0.0

## Implementation Details

### JSDoc Annotation Format

Each route uses the following JSDoc format:

```javascript
/**
 * @swagger
 * /path/to/endpoint:
 *   post:
 *     summary: Short description
 *     tags: [Module Name]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 *       400:
 *         description: Validation error
 */
router.post('/path/to/endpoint', controller.method);
```

### Configuration Files

**swagger.js** includes:
- OpenAPI 3.0 definition
- API metadata (title, version, description)
- Server configurations (development & production)
- Security schemes (BearerAuth)
- Reusable schema definitions
- Reference to all route files via `apis: ['./routes/*.js']`

**app.js** updates:
- Imports Swagger UI and JsDoc modules
- Mounts Swagger UI at `/api-docs` endpoint
- Serves Swagger JSON specification at `/api-docs.json`
- Configures Swagger UI options and styling

## Example Usage

### 1. Test Authentication Flow
1. Go to `/auth/register` endpoint
2. Click "Try it out"
3. Fill in user details
4. Click "Execute"
5. Copy the JWT token from response
6. Click the lock icon to authorize
7. Paste token and test protected endpoints

### 2. Test File Upload
1. Navigate to profile picture upload endpoint
2. Click "Try it out"
3. Select file from form
4. Execute request
5. View file upload confirmation

### 3. Test with Query Parameters
1. Go to search or list endpoint
2. Click "Try it out"
3. Fill in query parameters (pagination, filters, etc.)
4. Execute and view results

## API Response Format

All endpoints follow a standardized response format:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Notes

1. **CORS Configuration**: API allows requests from configured frontend URLs
2. **Rate Limiting**: 
   - General endpoints: 100 requests per 15 minutes
   - Auth endpoints: 5 attempts per 15 minutes
3. **JWT Tokens**: All protected endpoints require valid JWT in Authorization header
4. **HTTPS**: Production API uses HTTPS only

## Troubleshooting

### "Could not render this component" error
- Ensure all route files have valid @swagger JSDoc comments
- Check JSON syntax in swagger definitions
- Verify file paths in swagger.js `apis` configuration

### Authorization not working
- Ensure JWT token is provided correctly
- Check token expiration
- Verify token format: `Bearer <token>`

### CORS errors
- Verify frontend URL is in CORS configuration
- Check that cookies/credentials are properly configured

## Future Enhancements

1. Add request/response examples for all endpoints
2. Add webhook documentation
3. Create API client code generation
4. Add integration test examples
5. Document rate limiting and pagination

## Support

For API documentation issues or improvements:
1. Check the Swagger UI interface
2. Review JSDoc comments in route files
3. Consult README.md for general API information
4. Contact support@castglo.com for assistance

---

**API Version**: 1.0.0  
**Last Updated**: 2024  
**Documentation Generator**: swagger-jsdoc 6.2.8  
**UI Framework**: Swagger UI Express 5.0.0
