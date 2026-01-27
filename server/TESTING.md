# Castglo API - Testing Guide

## Quick Test with cURL

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Talent",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "talent"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

Save the returned `token` for subsequent requests.

### 4. Get Current User (Protected Route)
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Create Lead
```bash
curl -X POST http://localhost:5000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Developer",
    "email": "jane@example.com",
    "roleInterestedIn": "casting_director",
    "feedback": "Interested in learning more about the platform",
    "consent": true
  }'
```

### 6. Create Casting Call
```bash
curl -X POST http://localhost:5000/api/v1/casting-calls \
  -H "Authorization: Bearer YOUR_DIRECTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lead Actor for Indie Film",
    "description": "Looking for experienced actor for indie film",
    "projectName": "Summer Project",
    "projectType": "film",
    "location": {
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA"
    },
    "roles": [
      {
        "title": "Lead Actor",
        "description": "Main protagonist",
        "numberOfPositions": 1,
        "requiredSkills": ["Acting", "Drama"],
        "minExperience": "3 years"
      }
    ],
    "deadline": "2025-03-31T23:59:59Z",
    "compensationType": "paid",
    "compensationAmount": 5000
  }'
```

### 7. Get Casting Calls
```bash
curl http://localhost:5000/api/v1/casting-calls?status=open&page=1&limit=10
```

### 8. Apply to Casting Call
```bash
curl -X POST http://localhost:5000/api/v1/applications \
  -H "Authorization: Bearer YOUR_TALENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "castingCallId": "CASTING_CALL_ID",
    "appliedRole": "Lead Actor",
    "applicationData": {
      "coverLetter": "I am very interested in this role...",
      "experienceLevel": "professional"
    }
  }'
```

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Castglo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/auth/register",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "auth", "register"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"SecurePassword123\",\"role\":\"talent\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "auth", "login"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"SecurePassword123\"}"
            }
          }
        },
        {
          "name": "Get Current User",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/auth/me",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "auth", "me"]
            }
          }
        }
      ]
    },
    {
      "name": "Leads",
      "item": [
        {
          "name": "Create Lead",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/leads",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "leads"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\"fullName\":\"Lead Name\",\"email\":\"lead@example.com\",\"roleInterestedIn\":\"talent\",\"consent\":true}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

## API Testing Checklist

### Authentication Tests
- [ ] Register with valid data
- [ ] Register with existing email (should fail)
- [ ] Register with weak password (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected route without token (should fail)
- [ ] Access protected route with invalid token (should fail)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Change password

### User Management Tests
- [ ] Get user profile
- [ ] Update user profile
- [ ] Upload profile picture
- [ ] Delete account (requires password)
- [ ] Search users
- [ ] Get public user profile
- [ ] View suspended user (should fail)

### Profile Tests
- [ ] Create profile
- [ ] Get own profile
- [ ] Update own profile
- [ ] Add headshot (talent)
- [ ] Delete headshot
- [ ] Upload showreel
- [ ] Set profile visibility
- [ ] Search profiles with filters
- [ ] Get public profile

### Casting Call Tests
- [ ] Create casting call (non-director should fail)
- [ ] Get all casting calls
- [ ] Get casting call details
- [ ] Update casting call (only creator)
- [ ] Close casting call
- [ ] Delete casting call
- [ ] Get my listings
- [ ] Feature casting call
- [ ] Search casting calls

### Application Tests
- [ ] Apply to casting call
- [ ] Cannot apply twice to same casting call
- [ ] Get my applications
- [ ] Get casting call applications (director only)
- [ ] Shortlist application
- [ ] Reject application with reason
- [ ] Accept application
- [ ] Add communication message
- [ ] Withdraw application
- [ ] Get application details

### Subscription Tests
- [ ] Get available plans
- [ ] Get subscription status
- [ ] Create checkout session
- [ ] Get subscription details
- [ ] Upgrade subscription
- [ ] Cancel subscription
- [ ] Webhook processing

### Admin Tests
- [ ] Get all users (admin only)
- [ ] Suspend user (admin only)
- [ ] Unsuspend user
- [ ] Verify profile (admin only)
- [ ] Delete user (admin only)
- [ ] Get action logs (admin only)
- [ ] Get analytics (admin only)
- [ ] Get leads (admin only)
- [ ] Convert lead (admin only)

## Performance Testing

### Load Testing with Apache Bench
```bash
# 1000 requests with 10 concurrent
ab -n 1000 -c 10 http://localhost:5000/api/v1/casting-calls
```

### Load Testing with wrk
```bash
# Install wrk: https://github.com/wg/wrk
wrk -t12 -c400 -d30s http://localhost:5000/api/v1/casting-calls
```

## Stress Testing

```bash
# Test with increasing load
for i in {1..100}; do
  curl http://localhost:5000/api/v1/casting-calls &
done
wait
```

## Error Handling Tests

### Test 400 Bad Request
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
```

### Test 401 Unauthorized
```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:5000/api/v1/auth/me
```

### Test 403 Forbidden
```bash
# Talent trying to create casting call
curl -X POST http://localhost:5000/api/v1/casting-calls \
  -H "Authorization: Bearer talent_token" \
  -d '{...}'
```

### Test 404 Not Found
```bash
curl http://localhost:5000/api/v1/casting-calls/invalid-id
```

### Test 429 Rate Limit
```bash
# Make many requests quickly
for i in {1..50}; do
  curl http://localhost:5000/api/v1/auth/me &
done
```

## Database Query Tests

### Test Pagination
```bash
curl "http://localhost:5000/api/v1/casting-calls?page=1&limit=10"
curl "http://localhost:5000/api/v1/casting-calls?page=2&limit=10"
```

### Test Filtering
```bash
curl "http://localhost:5000/api/v1/casting-calls?status=open&projectType=film"
curl "http://localhost:5000/api/v1/users/search?role=talent&search=john"
```

### Test Sorting
```bash
curl "http://localhost:5000/api/v1/casting-calls?sortBy=-createdAt"
curl "http://localhost:5000/api/v1/casting-calls?sortBy=deadline"
```

## Integration Tests

### Full User Journey - Talent
1. Register as talent
2. Verify email
3. Create profile with headshots
4. Browse casting calls
5. Apply to casting call
6. Check application status

### Full User Journey - Casting Director
1. Register as casting director
2. Verify email
3. Create profile
4. Create casting call
5. View applicants
6. Shortlist/reject applications

### Subscription Flow
1. Get plans
2. Create checkout session
3. Simulate payment (Stripe test mode)
4. Verify subscription status
5. Upgrade/downgrade plan
6. Cancel subscription

## Debugging Tips

### Enable Detailed Logging
```javascript
// In development
console.log('Request:', req.method, req.path);
console.log('User:', req.user._id);
console.log('Response:', res.statusCode);
```

### Monitor Database
```bash
# Connect to MongoDB and monitor
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/castglo"
> db.users.find().count()
> db.applications.find({status: "submitted"}).count()
```

### Check Server Health
```bash
curl -v http://localhost:5000/health
# Should return 200 with success message
```

### View Logs
```bash
# PM2 logs
pm2 logs castglo-api

# Docker logs
docker logs castglo-api

# Cloud Run logs
gcloud run logs read castglo-backend
```

## Sample Test Data

### Test Talent
```
Email: talent@test.com
Password: TestPassword123!
Role: talent
```

### Test Casting Director
```
Email: director@test.com
Password: TestPassword123!
Role: casting_director
```

### Test Admin
```
Email: admin@castglo.com
Password: AdminPassword123!
Role: admin
```

## Useful Resources

- [Postman](https://www.postman.com/) - API testing tool
- [Insomnia](https://insomnia.rest/) - REST client
- [Thunder Client](https://www.thunderclient.io/) - VS Code extension
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - VS Code extension
