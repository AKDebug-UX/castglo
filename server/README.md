# Castglo Backend API

## Overview

Castglo is an investor-ready casting marketplace platform that connects Talents, Casting Directors, and Industry Professionals. This is the complete Node.js/Express backend built with the MERN stack.

## Features

- **Landing Page Lead System**: Capture early interest from potential users
- **User Authentication**: JWT-based auth with email verification and password reset
- **User Profiles**: Talent, Casting Director, and Industry Professional profiles
- **Casting Calls**: Create, manage, and search casting calls
- **Applications**: Submit and manage applications for casting calls
- **Subscriptions**: Stripe integration for subscription management
- **Admin System**: User moderation, analytics, and content management
- **Media Management**: Cloudinary integration for secure media uploads
- **Email Notifications**: SendGrid/Nodemailer integration for transactional emails

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Media Storage**: Cloudinary
- **Payments**: Stripe
- **Email**: Nodemailer
- **Security**: Helmet, bcrypt, Rate Limiting

## Project Structure

```
server/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   └── env.js          # Environment variables
├── models/              # Database models
│   ├── User.js
│   ├── Lead.js
│   ├── Profile.js
│   ├── CastingCall.js
│   ├── Application.js
│   ├── Subscription.js
│   └── AdminActionLog.js
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── leadController.js
│   ├── userController.js
│   ├── profileController.js
│   ├── castingCallController.js
│   ├── applicationController.js
│   ├── subscriptionController.js
│   └── adminController.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── leadRoutes.js
│   ├── userRoutes.js
│   ├── profileRoutes.js
│   ├── castingCallRoutes.js
│   ├── applicationRoutes.js
│   ├── subscriptionRoutes.js
│   └── adminRoutes.js
├── middleware/          # Express middleware
│   ├── auth.js         # JWT authentication
│   ├── authorize.js    # Role-based authorization
│   └── errorHandler.js # Centralized error handling
├── services/            # Business logic
│   ├── emailService.js
│   ├── cloudinaryService.js
│   └── stripeService.js
├── utils/               # Helper functions
│   ├── validators.js
│   ├── jwt.js
│   └── helpers.js
├── app.js              # Express app setup
└── sever.js            # Server entry point (note: typo preserved from original)
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd castglo/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see Configuration section below)

5. **Start the server**
   ```bash
   npm run dev        # Development with nodemon
   npm start         # Production mode
   ```

## Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/castglo

# Server
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=https://mobile.app

# Admin
ADMIN_EMAIL=admin@castglo.com
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `GET /api/v1/auth/me` - Get current user profile

### Leads
- `POST /api/v1/leads` - Create lead from landing page
- `GET /api/v1/leads/admin/leads` - Get all leads (admin only)
- `GET /api/v1/leads/admin/leads/:id` - Get lead details (admin only)
- `PUT /api/v1/leads/admin/leads/:id/convert` - Convert lead to user (admin only)
- `DELETE /api/v1/leads/admin/leads/:id` - Delete lead (admin only)

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `PUT /api/v1/users/profile-picture` - Update profile picture
- `DELETE /api/v1/users/account` - Delete user account
- `GET /api/v1/users/search` - Search users
- `GET /api/v1/users/:userId` - Get public user profile

### Profiles
- `POST /api/v1/profiles` - Create profile
- `GET /api/v1/profiles/me` - Get own profile
- `PUT /api/v1/profiles/me` - Update own profile
- `POST /api/v1/profiles/me/headshots` - Add headshot (talent)
- `DELETE /api/v1/profiles/me/headshots/:headshotId` - Delete headshot
- `POST /api/v1/profiles/me/showreel` - Upload showreel (talent)
- `GET /api/v1/profiles/search` - Search profiles
- `GET /api/v1/profiles/:userId` - Get public profile

### Casting Calls
- `GET /api/v1/casting-calls` - Get all casting calls
- `POST /api/v1/casting-calls` - Create casting call (casting directors only)
- `GET /api/v1/casting-calls/:id` - Get casting call details
- `PUT /api/v1/casting-calls/:id` - Update casting call
- `PUT /api/v1/casting-calls/:id/close` - Close casting call
- `DELETE /api/v1/casting-calls/:id` - Delete casting call
- `GET /api/v1/casting-calls/user/my-listings` - Get user's casting calls

### Applications
- `POST /api/v1/applications` - Create application (talents only)
- `GET /api/v1/applications/me` - Get my applications (talents)
- `GET /api/v1/applications/:castingCallId` - Get applications for casting call
- `GET /api/v1/applications/details/:applicationId` - Get application details
- `PUT /api/v1/applications/:applicationId/shortlist` - Shortlist application
- `PUT /api/v1/applications/:applicationId/reject` - Reject application
- `PUT /api/v1/applications/:applicationId/accept` - Accept application
- `POST /api/v1/applications/:applicationId/communication` - Add message
- `DELETE /api/v1/applications/:applicationId` - Withdraw application

### Subscriptions
- `POST /api/v1/subscriptions/create-checkout-session` - Create Stripe checkout
- `GET /api/v1/subscriptions/status` - Get subscription status
- `GET /api/v1/subscriptions/details` - Get subscription details
- `POST /api/v1/subscriptions/upgrade` - Upgrade subscription
- `POST /api/v1/subscriptions/cancel` - Cancel subscription
- `POST /api/v1/subscriptions/webhook` - Stripe webhook handler
- `GET /api/v1/subscriptions/plans` - Get available plans

### Admin
- `GET /api/v1/admin/users` - Get all users (admin only)
- `PUT /api/v1/admin/users/:userId/suspend` - Suspend user
- `PUT /api/v1/admin/users/:userId/unsuspend` - Unsuspend user
- `PUT /api/v1/admin/users/:userId/verify` - Verify profile
- `DELETE /api/v1/admin/users/:userId` - Delete user
- `GET /api/v1/admin/action-logs` - Get admin action logs
- `GET /api/v1/admin/analytics` - Get platform analytics
- `GET /api/v1/admin/leads` - Get leads overview
- `GET /api/v1/admin/subscriptions` - Get subscriptions overview

### Health Check
- `GET /health` - API health check

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To authenticate:

1. Register or login to get a token
2. Include the token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <token>
   ```

## API Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

## Error Handling

The API implements centralized error handling:

- **400**: Bad Request - Validation errors
- **401**: Unauthorized - Missing or invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error

## Database Models

### User
- Full authentication management
- Role-based access control (talent, casting_director, industry_professional, admin)
- Account suspension and verification
- Login attempt tracking with account lockout

### Lead
- Landing page lead capture
- Conversion tracking
- UTM parameter tracking
- Consent management

### Profile
- Talent-specific: headshots, showreel, skills, experience, education
- Professional-specific: company info, past projects, specialization
- Privacy controls and verification status

### CastingCall
- Title, description, project details
- Roles and requirements
- Budget and compensation tracking
- Featured listings support
- Applicant and shortlist counting

### Application
- Status tracking (submitted, viewed, shortlisted, rejected, accepted, withdrawn)
- Communication history
- Rating and feedback system
- Attachment support

### Subscription
- Multiple pricing tiers (free, starter, professional, enterprise)
- Stripe integration
- Payment history and billing management
- Feature gating by plan

### AdminActionLog
- Comprehensive audit trail
- All admin actions logged with before/after state
- IP address and user agent tracking
- Severity levels for actions

## Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT**: Secure token-based authentication with expiration
- **Rate Limiting**: DDoS protection on critical endpoints
- **CORS**: Restricted to whitelisted frontend URLs
- **Helmet**: HTTP header security
- **Input Validation**: Comprehensive validation on all inputs
- **Authorization**: Role-based access control on all endpoints
- **Account Lockout**: Automatic lockout after failed login attempts
- **Audit Logging**: Complete audit trail of admin actions

## Media Upload

Media uploads are handled through Cloudinary:

- **Images**: Up to 50 MB, JPEG/PNG/WebP
- **Videos**: Up to 50 MB, MP4/WebM/MOV
- Auto-optimization for web delivery
- Automatic thumbnail generation

## Email Notifications

The system sends emails for:
- Email verification
- Password reset
- Application status updates
- Application notifications for casting directors
- Welcome emails

## Deployment

### Google Cloud Run

1. Ensure all environment variables are set
2. Create a `Dockerfile` (provided in deployment guide)
3. Deploy with:
   ```bash
   gcloud run deploy castglo-backend --source .
   ```

### Heroku

1. Create a Procfile:
   ```
   web: node sever.js
   ```

2. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=<your-mongo-uri>
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

## Testing

Start the development server:
```bash
npm run dev
```

Access the API at: `http://localhost:5000`

Health check: `http://localhost:5000/health`

## Production Checklist

- [ ] Update JWT_SECRET with a strong random key
- [ ] Configure production MongoDB URI
- [ ] Set NODE_ENV=production
- [ ] Configure Stripe production keys
- [ ] Set up Cloudinary production account
- [ ] Configure email service credentials
- [ ] Update CORS origins for frontend
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure automated backups
- [ ] Set up CI/CD pipeline

## Support

For API documentation and support, visit the Castglo dashboard or contact support@castglo.com.

## License

MIT
