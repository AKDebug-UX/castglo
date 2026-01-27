# Swagger Documentation - Developer Quick Start

## Accessing the API Documentation

### Development
```bash
npm start
# Then visit: http://localhost:5000/api-docs
```

### Production
```
https://api.castglo.com/api-docs
```

## Complete Endpoint Reference

### 📝 Authentication (7 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ✗ | Create new user account |
| POST | `/auth/login` | ✗ | User login |
| POST | `/auth/verify-email` | ✗ | Verify email address |
| POST | `/auth/forgot-password` | ✗ | Request password reset |
| POST | `/auth/reset-password` | ✗ | Reset password |
| POST | `/auth/change-password` | ✓ | Change password (logged in) |
| GET | `/auth/me` | ✓ | Get current user profile |

### 👥 Users (6 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | ✓ | Get user profile |
| PUT | `/users/profile` | ✓ | Update user profile |
| PUT | `/users/profile-picture` | ✓ | Upload profile picture |
| DELETE | `/users/account` | ✓ | Delete account |
| GET | `/users/search` | ✓ | Search users |
| GET | `/users/{userId}` | ✓ | Get public user profile |

### 🎬 Profiles (8 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profiles` | ✓ | Create profile |
| GET | `/profiles/me` | ✓ | Get my profile |
| PUT | `/profiles/me` | ✓ | Update my profile |
| POST | `/profiles/me/headshots` | ✓ | Add headshot image |
| DELETE | `/profiles/me/headshots/{id}` | ✓ | Delete headshot |
| POST | `/profiles/me/showreel` | ✓ | Upload showreel video |
| GET | `/profiles/search` | ✓ | Search profiles |
| GET | `/profiles/{userId}` | ✓ | Get public profile |

### 📢 Casting Calls (7 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/casting-calls` | ✗ | List all casting calls |
| POST | `/casting-calls` | ✓ | Create casting call (director) |
| GET | `/casting-calls/user/my-listings` | ✓ | Get my listings (director) |
| GET | `/casting-calls/{id}` | ✗ | Get casting call details |
| PUT | `/casting-calls/{id}` | ✓ | Update casting call |
| PUT | `/casting-calls/{id}/close` | ✓ | Close casting call |
| DELETE | `/casting-calls/{id}` | ✓ | Delete casting call |

### 📤 Applications (9 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/applications` | ✓ | Submit application (talent) |
| GET | `/applications/me` | ✓ | Get my applications (talent) |
| GET | `/applications/{castingCallId}` | ✓ | Get casting call applications |
| GET | `/applications/details/{id}` | ✓ | Get application details |
| PUT | `/applications/{id}/shortlist` | ✓ | Shortlist application (director) |
| PUT | `/applications/{id}/reject` | ✓ | Reject application (director) |
| PUT | `/applications/{id}/accept` | ✓ | Accept application (director) |
| POST | `/applications/{id}/communication` | ✓ | Add message to application |
| DELETE | `/applications/{id}` | ✓ | Withdraw application (talent) |

### 💳 Subscriptions (7 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/subscriptions/create-checkout-session` | ✓ | Create Stripe checkout |
| GET | `/subscriptions/status` | ✓ | Get subscription status |
| GET | `/subscriptions/details` | ✓ | Get subscription details |
| POST | `/subscriptions/upgrade` | ✓ | Upgrade subscription plan |
| POST | `/subscriptions/cancel` | ✓ | Cancel subscription |
| POST | `/subscriptions/webhook` | ✗ | Stripe webhook handler |
| GET | `/subscriptions/plans` | ✗ | Get available plans |

### 🎫 Leads (5 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/leads` | ✗ | Create landing page lead |
| GET | `/leads/admin/leads` | ✓ | Get all leads (admin) |
| GET | `/leads/admin/leads/{id}` | ✓ | Get lead details (admin) |
| PUT | `/leads/admin/leads/{id}/convert` | ✓ | Convert lead to user (admin) |
| DELETE | `/leads/admin/leads/{id}` | ✓ | Delete lead (admin) |

### ⚙️ Admin (9 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | ✓ | Get all users |
| PUT | `/admin/users/{id}/suspend` | ✓ | Suspend user |
| PUT | `/admin/users/{id}/unsuspend` | ✓ | Unsuspend user |
| PUT | `/admin/users/{id}/verify` | ✓ | Verify user profile |
| DELETE | `/admin/users/{id}` | ✓ | Delete user |
| GET | `/admin/action-logs` | ✓ | Get action logs |
| GET | `/admin/analytics` | ✓ | Get platform analytics |
| GET | `/admin/leads` | ✓ | Get leads overview |
| GET | `/admin/subscriptions` | ✓ | Get subscription overview |

## Testing Steps

### 1. Start the Server
```bash
cd server
npm install
npm start
```

### 2. Open Swagger UI
```
http://localhost:5000/api-docs
```

### 3. Test Authentication Flow
1. Click on "Authentication" section
2. Use `/auth/register` to create an account
3. Use `/auth/login` to get a JWT token
4. Click the lock icon 🔒 and paste your token
5. Test other protected endpoints

### 4. Common Request Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## Authentication with Swagger UI

### Getting Your Token
1. Register: `POST /auth/register`
2. Login: `POST /auth/login`
3. Copy the token from response

### Using Token
1. Click 🔒 (lock icon) in top-right
2. Paste token in the dialog
3. All subsequent requests will include it

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate/conflicting data |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error |

## Rate Limits

- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 attempts per 15 minutes

## File Upload Endpoints

These endpoints accept file uploads via `multipart/form-data`:
- `PUT /users/profile-picture` - Profile image
- `POST /profiles/me/headshots` - Headshot images
- `POST /profiles/me/showreel` - Video file

### Upload Example (cURL)
```bash
curl -X PUT http://localhost:5000/api/v1/users/profile-picture \
  -H "Authorization: Bearer <token>" \
  -F "profilePicture=@image.jpg"
```

## Popular Swagger UI Features

### Try It Out
- Click "Try it out" button on any endpoint
- Fill in parameters and request body
- Click "Execute" to send request
- View response immediately

### Schema Inspection
- Scroll to bottom to see all available schemas
- Click schema name to expand/collapse
- View field types and examples

### Response Examples
- View example request/response
- Check status codes and descriptions
- Copy example values for testing

## Environment Variables

For local development, ensure `.env` file has:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=...
STRIPE_SECRET_KEY=...
```

See `.env.example` for all required variables.

## Troubleshooting

### API not responding
- Ensure server is running: `npm start`
- Check port 5000 is available
- Verify MongoDB connection

### Swagger UI not loading
- Clear browser cache
- Check console for errors
- Verify route JSDoc syntax

### Authentication failing
- Token may be expired
- Check token format (should start with "Bearer ")
- Verify token in Authorization header

### File upload failing
- Ensure `Content-Type` is `multipart/form-data`
- Check file size limits (10MB max)
- Verify file format is supported

## Next Steps

1. **Read Full Documentation**: Visit `/api-docs` for complete details
2. **Review Examples**: Each endpoint has example requests/responses
3. **Test API**: Use "Try it out" on various endpoints
4. **Integrate**: Use endpoints in your frontend application

## Additional Resources

- `README.md` - General API overview
- `DEPLOYMENT.md` - Deployment guides
- `TESTING.md` - Testing procedures
- `SWAGGER_INTEGRATION.md` - Swagger setup details

---

**Last Updated**: 2024  
**Total Endpoints**: 62  
**Documentation Format**: OpenAPI 3.0 / Swagger 2.0
