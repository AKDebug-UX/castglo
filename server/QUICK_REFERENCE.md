# Castglo Backend - Quick Reference Card

## 🚀 Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env

# Develop
npm run dev

# Production
npm start
```

## 📝 Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| MONGO_URI | ✅ | mongodb+srv://user:pass@cluster... |
| JWT_SECRET | ✅ | your-secret-key-32-chars-min |
| NODE_ENV | ✅ | development \| production |
| PORT | ⚠️ | 5000 |
| CLOUDINARY_NAME | ✅ | your-cloud-name |
| CLOUDINARY_API_KEY | ✅ | your-api-key |
| CLOUDINARY_API_SECRET | ✅ | your-api-secret |
| STRIPE_SECRET_KEY | ✅ | sk_test_... |
| STRIPE_WEBHOOK_SECRET | ✅ | whsec_... |
| EMAIL_SERVICE | ✅ | gmail |
| EMAIL_USER | ✅ | your-email@gmail.com |
| EMAIL_PASS | ✅ | your-app-password |
| FRONTEND_URL | ✅ | http://localhost:3000 |
| MOBILE_APP_URL | ✅ | https://mobile.app |

## 📁 Project Structure

```
server/
├── config/            → Configuration
├── models/            → Database schemas
├── controllers/       → Business logic
├── routes/            → API endpoints
├── middleware/        → Auth, validation, errors
├── services/          → Email, Cloudinary, Stripe
├── utils/             → Helpers & validators
├── app.js             → Express setup
└── sever.js           → Server entry
```

## 🔗 API Base URLs

```
Development: http://localhost:5000/api/v1
Production:  https://your-domain.com/api/v1
```

## 🔑 User Roles

| Role | Permission |
|------|-----------|
| `talent` | Apply, view casting calls, manage profile |
| `casting_director` | Create casting calls, shortlist, hire |
| `industry_professional` | View talent, network |
| `admin` | Full access, moderation, analytics |

## 🔐 Authentication

```bash
# 1. Register
POST /auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "talent"
}

# 2. Login
POST /auth/login
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

# 3. Use token in headers
Authorization: Bearer <token>
```

## 📊 Database Models

| Model | Purpose |
|-------|---------|
| User | Accounts, auth, roles |
| Lead | Landing page captures |
| Profile | User profiles, skills, media |
| CastingCall | Casting opportunities |
| Application | Job applications |
| Subscription | Billing & plans |
| AdminActionLog | Audit trail |

## 🎯 Core Endpoints

### Authentication
```
POST   /auth/register
POST   /auth/login
POST   /auth/verify-email
POST   /auth/forgot-password
POST   /auth/reset-password
```

### Casting Calls
```
GET    /casting-calls
POST   /casting-calls
GET    /casting-calls/:id
PUT    /casting-calls/:id
DELETE /casting-calls/:id
```

### Applications
```
POST   /applications
GET    /applications/me
GET    /applications/:castingCallId
PUT    /applications/:id/shortlist
PUT    /applications/:id/reject
```

### Subscriptions
```
GET    /subscriptions/plans
POST   /subscriptions/create-checkout-session
GET    /subscriptions/status
POST   /subscriptions/cancel
```

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com","password":"Pass123!","role":"talent"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'

# Get current user (with token)
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐳 Docker Commands

```bash
# Build
docker build -t castglo-api .

# Run with Compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

## 📦 Key Dependencies

```json
{
  "express": "4.18.2",
  "mongoose": "8.0.0",
  "jsonwebtoken": "9.1.2",
  "bcryptjs": "2.4.3",
  "stripe": "14.0.0",
  "cloudinary": "1.40.0",
  "nodemailer": "6.9.7"
}
```

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong (>32 chars)
- [ ] NODE_ENV=production
- [ ] CORS configured for your domain
- [ ] HTTPS enabled
- [ ] Database backups enabled
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] No secrets in code/git
- [ ] Monitoring & alerting set up

## 🚨 Common Errors

| Error | Solution |
|-------|----------|
| ECONNREFUSED | MongoDB not running, check MONGO_URI |
| JsonWebTokenError | Invalid/expired token, login again |
| ValidationError | Invalid input, check request format |
| CastError | Invalid MongoDB ID |
| CORS error | Add domain to FRONTEND_URL |

## 📈 Performance Tips

- Add Redis caching for frequently accessed data
- Implement database query pagination
- Use CDN for media (Cloudinary handles this)
- Enable compression (built-in)
- Monitor with Cloud provider tools
- Set up error tracking (Sentry)

## 🚀 Deployment Commands

### Heroku
```bash
heroku create castglo-backend
heroku config:set MONGO_URI="mongodb+srv://..."
git push heroku main
```

### Google Cloud Run
```bash
gcloud run deploy castglo-backend \
  --image gcr.io/PROJECT/castglo-backend \
  --set-env-vars MONGO_URI=mongodb://...
```

### Docker
```bash
docker build -t castglo-api .
docker run -e MONGO_URI="mongodb://..." castglo-api
```

## 📖 Documentation

- `README.md` - Full API docs
- `DEPLOYMENT.md` - Deployment guides
- `TESTING.md` - API testing
- `IMPLEMENTATION_SUMMARY.md` - Feature list

## 💡 Tips

1. Use Postman for API testing
2. Check `TESTING.md` for example requests
3. Enable logging in development: `npm run dev`
4. Use `.env` file, never commit secrets
5. Test API endpoints before deployment
6. Monitor logs in production
7. Set up database backups
8. Use strong JWT_SECRET in production

## 📞 Help

- API docs: See `README.md`
- Deployment: See `DEPLOYMENT.md`
- Testing: See `TESTING.md`
- Features: See `IMPLEMENTATION_SUMMARY.md`

---

**Castglo Backend - Complete & Production Ready** ✅
