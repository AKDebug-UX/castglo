# Getting Started with Swagger UI - Quick Start Guide

## 🚀 Start Here

This guide will have you testing the Castglo API in 5 minutes.

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Create `.env` file in `server/` directory:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/castglo
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=exp://localhost:19000

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

See `.env.example` for all required variables.

### 3. Start the Server
```bash
npm start
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on port 5000
✓ Swagger documentation available at /api-docs
```

### 4. Open Swagger UI
Visit in your browser:
```
http://localhost:5000/api-docs
```

## 📚 Exploring the API

### What You'll See
- **8 Main Categories** (collapsed sections)
  - Authentication
  - Users
  - Profiles
  - Casting Calls
  - Applications
  - Subscriptions
  - Leads
  - Admin

- **62 Total Endpoints** documented with full details

### Expanding Sections
1. Click on a category name to expand it
2. Click on an endpoint to see full details
3. Click "Try it out" to test it

## 🔐 Testing Authentication

### Step 1: Create an Account
1. Click **Authentication** section
2. Find `POST /auth/register`
3. Click "Try it out"
4. Fill in the form:
   ```json
   {
     "fullName": "Your Name",
     "email": "you@example.com",
     "password": "Password123!",
     "role": "talent"
   }
   ```
5. Click "Execute"
6. You should get a 201 response with user data

### Step 2: Login
1. Find `POST /auth/login`
2. Click "Try it out"
3. Enter credentials:
   ```json
   {
     "email": "you@example.com",
     "password": "Password123!"
   }
   ```
4. Click "Execute"
5. **Copy the token from the response** (it's in the `data.token` field)

### Step 3: Authorize Swagger UI
1. Click the lock icon 🔒 in the top-right corner
2. Paste your token in the dialog box
3. Click "Authorize"
4. You're now authenticated for all protected endpoints!

## 🧪 Testing Different Endpoint Types

### Test 1: Simple GET (Protected)
1. With token authorized, find `GET /auth/me`
2. Click "Try it out"
3. Click "Execute"
4. You should see your user profile

### Test 2: GET with Query Parameters
1. Find `GET /users/search`
2. Click "Try it out"
3. Add query parameter: `query=John`
4. Click "Execute"
5. See search results

### Test 3: POST with Body (Protected)
1. Find `POST /profiles`
2. Click "Try it out"
3. Enter request body:
   ```json
   {
     "profileType": "talent",
     "bio": "I am an actor",
     "skills": ["Acting", "Singing"]
   }
   ```
4. Click "Execute"
5. Profile created!

### Test 4: PUT (File Upload)
1. Find `PUT /users/profile-picture`
2. Click "Try it out"
3. Click the file input field
4. Select an image file from your computer
5. Click "Execute"
6. Image uploaded!

### Test 5: GET with Path Parameter
1. Find `GET /profiles/{userId}`
2. Click "Try it out"
3. Enter a userId (from your profile or another user)
4. Click "Execute"
5. See the public profile

## 📊 Viewing Response Data

After each "Execute", you'll see:

**Response Headers**
```
content-type: application/json
status: 200 OK
```

**Response Body**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Key Info**
- Green status codes (200-201) = Success
- Red status codes (400+) = Error
- Check the message and data fields

## 🎯 Common Testing Scenarios

### Scenario 1: Complete User Journey
1. Register account
2. Create profile
3. Login
4. View own profile
5. Search for other profiles
6. Update profile

### Scenario 2: Casting Director Flow
1. Register as "casting_director"
2. Create casting call
3. View your listings
4. See applications received

### Scenario 3: Talent Flow
1. Register as "talent"
2. Create profile with headshots
3. Search casting calls
4. Submit application
5. Check application status

### Scenario 4: Admin Operations
1. Register an admin account
2. View all users
3. Check admin analytics
4. Review action logs

## 💡 Pro Tips

### Tip 1: Copy cURL Commands
1. After testing an endpoint
2. Click "Copy cURL"
3. Use in terminal for API testing:
   ```bash
   curl -X GET http://localhost:5000/api/v1/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Tip 2: Check Request/Response Format
1. Scroll to see the exact request sent
2. View the exact response received
3. Useful for debugging

### Tip 3: Schemas Section
1. Scroll to bottom of Swagger UI
2. See all available data models
3. Understand object structures

### Tip 4: Filter Endpoints
1. Use the search box
2. Type endpoint name
3. Quickly find what you need

### Tip 5: Save Authorization
1. After authorizing once
2. Token stays for current session
3. Refresh page and it's still there

## 🆘 Troubleshooting

### "Cannot connect to server"
- Check if server is running: `npm start`
- Check if port 5000 is available
- Check firewall settings

### "Unauthorized" error (401)
- Make sure you clicked the lock icon
- Paste token correctly
- Token might have expired

### "Forbidden" error (403)
- Check your user role
- Some endpoints require specific roles
- Example: admin endpoints need admin role

### "Validation error" (400)
- Check required fields
- Verify data types
- Check example in documentation

### File upload not working
- File too large (max 10MB)
- Wrong file type
- Check Cloudinary configuration

## 📖 Next Steps

After testing basic functionality:

1. **Read Full Documentation**
   - SWAGGER_QUICK_REFERENCE.md
   - SWAGGER_INTEGRATION.md

2. **Explore All Endpoints**
   - Go through each category
   - Try different operations
   - Understand response formats

3. **Review Code**
   - Check route implementations
   - Understand middleware
   - Review error handling

4. **Start Integration**
   - Use endpoints in your frontend
   - Implement authentication flow
   - Handle responses properly

## 🔗 Useful Resources

### In Your Project
- `README.md` - General API overview
- `DEPLOYMENT.md` - How to deploy
- `TESTING.md` - Complete testing guide
- `SWAGGER_QUICK_REFERENCE.md` - Endpoint reference

### Online
- OpenAPI Standard: https://spec.openapis.org/
- Swagger UI Docs: https://swagger.io/tools/swagger-ui/
- REST API Best Practices: https://restfulapi.net/

## 💬 Getting Help

### Common Questions

**Q: How do I get a token?**
A: Use `/auth/register` and `/auth/login` endpoints. Copy token from login response.

**Q: Which endpoints are protected?**
A: Look for the lock icon 🔒 next to the endpoint name. These require authentication.

**Q: How do I upload a file?**
A: Use endpoints marked with `multipart/form-data`. Select file in "Try it out" form.

**Q: What's the response format?**
A: All responses are JSON with `{ success, message, data }` structure.

**Q: Can I test without token?**
A: Yes, public endpoints (no lock icon) work without authentication.

## ✅ Testing Checklist

- [ ] Server started successfully
- [ ] Swagger UI loads
- [ ] Can see all 62 endpoints
- [ ] Created test account
- [ ] Got JWT token
- [ ] Authorized in Swagger UI
- [ ] Tested protected endpoint
- [ ] Tested file upload
- [ ] Got successful responses
- [ ] Read documentation

## 🎉 You're Ready!

You now have:
- ✅ Running API server
- ✅ Interactive API documentation
- ✅ Working authentication
- ✅ Test account
- ✅ Full endpoint reference

**Next: Start integrating with your frontend!**

---

**Need more help?**
- Check server logs for errors
- Read documentation files
- Review JSDoc in route files
- Check .env configuration

**Ready to deploy?**
- See DEPLOYMENT.md for guides
- Configure production environment
- Set up MongoDB Atlas
- Configure Cloudinary & Stripe
