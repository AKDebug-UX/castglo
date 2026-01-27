# Swagger JSDoc Format Reference

This document explains the JSDoc annotation format used throughout the Castglo API routes.

## Overview

All routes use swagger-jsdoc to generate OpenAPI 3.0 documentation from JSDoc comments. Each endpoint is documented using the `@swagger` tag.

## Basic Format

```javascript
/**
 * @swagger
 * /path/to/endpoint:
 *   post:
 *     summary: Endpoint summary
 *     tags: [Category]
 *     description: Detailed description (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field1, field2]
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success message
 *       400:
 *         description: Validation error
 */
router.post('/path/to/endpoint', controller.method);
```

## Complete Components

### 1. **Endpoint Path**
```javascript
/**
 * @swagger
 * /auth/register:              // Endpoint path (without /api/v1 prefix)
 *   post:                      // HTTP method
```

### 2. **Method Definition**
```javascript
*   get:                        // HTTP method: get, post, put, delete, patch
*   post:
*   put:
*   delete:
*   patch:
```

### 3. **Summary & Description**
```javascript
*     summary: Register a new user                    // Short description (required)
*     description: Create a new user account...       // Detailed description (optional)
*     tags: [Authentication]                          // Category grouping (required)
```

### 4. **Request Parameters**
#### Path Parameters
```javascript
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: string
*         description: User unique identifier
```

#### Query Parameters
```javascript
*     parameters:
*       - in: query
*         name: page
*         schema:
*           type: integer
*         description: Page number for pagination
*       - in: query
*         name: limit
*         schema:
*           type: integer
*         description: Items per page
```

#### Header Parameters
```javascript
*     parameters:
*       - in: header
*         name: X-Custom-Header
*         schema:
*           type: string
*         required: true
```

### 5. **Request Body**
#### JSON Body
```javascript
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required: [email, password]
*             properties:
*               email:
*                 type: string
*                 format: email
*                 example: user@example.com
*               password:
*                 type: string
*                 format: password
*                 minLength: 8
*               role:
*                 type: string
*                 enum: [talent, casting_director]
```

#### File Upload
```javascript
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             required: [profilePicture]
*             properties:
*               profilePicture:
*                 type: string
*                 format: binary
*               description:
*                 type: string
```

### 6. **Responses**
#### Success Response
```javascript
*     responses:
*       200:
*         description: User profile retrieved successfully
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/SuccessResponse'
*       201:
*         description: Resource created successfully
```

#### Error Response
```javascript
*       400:
*         description: Validation error
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Error'
*       401:
*         description: Unauthorized - missing or invalid token
*       403:
*         description: Forbidden - insufficient permissions
*       404:
*         description: Resource not found
*       409:
*         description: Conflict - duplicate or conflicting data
```

### 7. **Security/Authentication**
```javascript
*     security:
*       - BearerAuth: []           // For protected endpoints
```

Use when endpoint requires authentication.

## Real Examples from Routes

### Example 1: Simple POST (Registration)
```javascript
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, role]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Talent
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [talent, casting_director, industry_professional]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post('/register', authController.register);
```

### Example 2: Protected GET (Get Profile)
```javascript
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, userController.getUserProfile);
```

### Example 3: PUT with Path Parameters
```javascript
/**
 * @swagger
 * /casting-calls/{id}:
 *   put:
 *     summary: Update casting call
 *     tags: [Casting Calls]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Casting call ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Casting call updated successfully
 *       404:
 *         description: Casting call not found
 */
router.put('/:id', protect, authorize('casting_director', 'admin'), castingCallController.updateCastingCall);
```

### Example 4: File Upload
```javascript
/**
 * @swagger
 * /users/profile-picture:
 *   put:
 *     summary: Update user profile picture
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [profilePicture]
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Invalid file
 */
router.put('/profile-picture', protect, upload.single('profilePicture'), userController.updateProfilePicture);
```

### Example 5: With Query Parameters
```javascript
/**
 * @swagger
 * /casting-calls:
 *   get:
 *     summary: Get all casting calls
 *     tags: [Casting Calls]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of casting calls
 */
router.get('/', castingCallController.getCastingCalls);
```

## Common Tags

Tags organize endpoints in the Swagger UI. Use these standard tags:

```
[Authentication]    - Auth endpoints
[Users]             - User management
[Profiles]          - User profiles
[Casting Calls]     - Casting calls
[Applications]      - Job applications
[Subscriptions]     - Subscription management
[Leads]             - Landing page leads
[Admin]             - Admin operations
```

## Common Schema References

```javascript
$ref: '#/components/schemas/SuccessResponse'  // Success response
$ref: '#/components/schemas/Error'             // Error response
$ref: '#/components/schemas/User'              // User object
$ref: '#/components/schemas/CastingCall'       // Casting call object
$ref: '#/components/schemas/Application'       // Application object
```

## Data Types

```javascript
type: string          // Text
type: number         // Integer or decimal
type: integer        // Whole number only
type: boolean        // true/false
type: array          // List of items
type: object         // Key-value object
```

## String Formats

```javascript
format: email        // Email address
format: password     // Password field
format: date-time    // ISO 8601 datetime
format: uuid         // UUID format
format: binary       // Binary file data
```

## Status Code Conventions

```
201  - Resource created
200  - Success
400  - Validation error
401  - Missing/invalid authentication
403  - Insufficient permissions
404  - Resource not found
409  - Conflict/duplicate
429  - Rate limit exceeded
500  - Server error
```

## Best Practices

1. **Always include summary** - Required, should be concise
2. **Use proper tags** - Helps organize documentation
3. **Document all parameters** - Path, query, headers
4. **Include request body schema** - For POST/PUT/PATCH
5. **Document all response codes** - Include descriptions
6. **Add security section** - For protected endpoints
7. **Use schema references** - For common types
8. **Include examples** - For clarity
9. **Be consistent** - Match format across all routes
10. **Keep descriptions clear** - Easy to understand

## Checking JSDoc Validity

To ensure your JSDoc is valid:

1. Start server: `npm start`
2. Visit: `http://localhost:5000/api-docs`
3. Check if endpoint appears correctly
4. Look for error messages in console
5. Fix any validation errors

## Common Issues

### Issue: Endpoint not appearing in Swagger UI
**Solution**: Check JSDoc syntax, ensure `@swagger` tag is present, verify file is in `routes/` folder

### Issue: Parameters not showing
**Solution**: Ensure proper indentation (2 spaces per level), check parameter `in` value (path/query/header)

### Issue: Schema not recognized
**Solution**: Use correct schema reference path, ensure schema exists in swagger.js

### Issue: Response not displayed
**Solution**: Check response code format (must be string: "200"), verify content type is application/json

## Additional Resources

- OpenAPI 3.0 Spec: https://spec.openapis.org/oas/v3.0.0
- swagger-jsdoc Docs: https://swagger-jsdoc.js.org/
- Swagger UI Docs: https://swagger.io/tools/swagger-ui/

---

This format is used consistently across all 62 endpoints in the Castglo API.
